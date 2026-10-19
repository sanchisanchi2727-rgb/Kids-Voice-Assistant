import time
import os
import re
import queue

import numpy as np
import nemo.collections.asr as nemo_asr
import sounddevice as sd
import soundfile as sf

from groq import Groq
from cartesia import Cartesia
from playsound3 import playsound


# ============================================================
# 1. CONFIG
# ============================================================

SAMPLE_RATE = 16000
CHANNELS = 1

# --- Voice Activity Detection (silence-based) settings ---
BLOCK_DURATION = 0.03        # seconds per audio chunk checked for speech/silence
SILENCE_THRESHOLD = 0.02     # RMS volume below this = "silence" (tune for your mic)
SILENCE_DURATION = 1.0       # seconds of silence after speech = "user stopped talking"
MAX_RECORD_SECONDS = 15      # safety cap so recording can't run forever
MIN_SPEECH_SECONDS = 0.3     # ignore tiny noise blips shorter than this

EXIT_WORDS = {"exit", "quit", "stop"}

MAX_HISTORY_TURNS = 6        # how many past user/assistant exchanges to remember


# ============================================================
# 2. SYSTEM PROMPT — KID-FRIENDLY (ages 5-10)
# ============================================================

SYSTEM_PROMPT = """
You are KODA, a friendly voice assistant for children aged 5 to 10.

Rules you must always follow:
- Use simple words a young child understands.
- Be warm, cheerful, and encouraging.
- Keep answers to 2 or 3 short sentences.
- Only talk about kid-appropriate topics: school, animals, science facts,
  games, stories, nature, space, sports, hobbies, being kind, etc.
- Never use bad language, insults, or rude words.
- Never discuss violence, weapons, dating, romance, alcohol, drugs,
  self-harm, or anything scary or adult.
- If a topic isn't appropriate for a child, gently redirect to something
  fun and safe instead, without explaining why.
- Never include instructions, rules, labels, or commentary about your
  own response. Only speak the answer itself.
- You can remember earlier parts of this conversation to understand
  follow-up questions like "he" or "that".
"""


# ============================================================
# 3. SAFETY FILTERS
# ============================================================

BLOCKED_WORDS = [
    "damn", "hell", "stupid idiot", "shut up",
    # For real use, replace this list with the `better_profanity` library,
    # which has a much larger, maintained word list.
]

CRISIS_PATTERNS = [
    r"\bkill myself\b",
    r"\bwant to die\b",
    r"\bhurt myself\b",
    r"\bend my life\b",
    r"\bsuicide\b",
    r"\bself[\s-]?harm\b",
    r"\bno one loves me\b",
]

CRISIS_RESPONSE = (
    "It sounds like something is really bothering you. "
    "Please go tell a parent, teacher, or grown-up you trust right now, "
    "so they can help you feel better."
)

SAFE_FALLBACK = (
    "I'm not able to talk about that. "
    "Want to hear a fun fact about animals or space instead?"
)


def contains_crisis_language(text: str) -> bool:
    lowered = text.lower()
    return any(re.search(pattern, lowered) for pattern in CRISIS_PATTERNS)


def contains_blocked_word(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in BLOCKED_WORDS)


def clean_answer(raw: str) -> str:
    """Strip hidden reasoning/think-blocks/labels so only the real answer is spoken."""
    if not raw:
        return ""
    cleaned = raw
    cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<reasoning>.*?</reasoning>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"</?[a-zA-Z_]+>", "", cleaned)
    cleaned = re.sub(
        r"^\s*(answer|final answer|response|output)\s*:\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    return cleaned.strip()


def make_answer_safe(answer: str) -> str:
    """Final safety net on the model's answer before it is ever spoken."""
    if contains_crisis_language(answer):
        return CRISIS_RESPONSE
    if contains_blocked_word(answer):
        return SAFE_FALLBACK
    return answer


# ============================================================
# 4. VOICE ACTIVITY DETECTION (record until user stops talking)
# ============================================================

def record_until_silence():
    """
    Starts recording immediately and stops automatically once the
    user has been silent for SILENCE_DURATION seconds after they
    started speaking. This replaces the old fixed 5-second recording.

    Returns a numpy float32 array of the recorded audio, or None if
    nothing meaningful (just silence/background noise) was captured.
    """
    block_size = int(SAMPLE_RATE * BLOCK_DURATION)
    audio_queue = queue.Queue()

    def callback(indata, frames, time_info, status):
        if status:
            print(f"[Audio] status: {status}")
        audio_queue.put(indata.copy())

    recorded_chunks = []
    speech_started = False
    silence_chunks = 0
    speech_chunks = 0
    total_chunks = 0

    chunks_for_silence = max(1, int(SILENCE_DURATION / BLOCK_DURATION))
    chunks_for_min_speech = max(1, int(MIN_SPEECH_SECONDS / BLOCK_DURATION))
    max_chunks = int(MAX_RECORD_SECONDS / BLOCK_DURATION)

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="float32",
        blocksize=block_size,
        callback=callback,
    ):
        while True:
            chunk = audio_queue.get()
            recorded_chunks.append(chunk)
            total_chunks += 1

            rms = float(np.sqrt(np.mean(chunk.astype(np.float64) ** 2)))

            if rms > SILENCE_THRESHOLD:
                speech_started = True
                speech_chunks += 1
                silence_chunks = 0
            elif speech_started:
                silence_chunks += 1

            if speech_started and silence_chunks >= chunks_for_silence:
                break

            if total_chunks >= max_chunks:
                print("[Audio] Max recording time reached, stopping.")
                break

    if not speech_started or speech_chunks < chunks_for_min_speech:
        return None

    return np.concatenate(recorded_chunks, axis=0)


# ============================================================
# 5. MAIN CONVERSATION LOOP
# ============================================================

def main():
    # ---- Load Parakeet ONCE ----
    print("Loading Parakeet... (one-time startup cost)")
    load_start = time.perf_counter()
    asr_model = nemo_asr.models.ASRModel.from_pretrained(
        model_name="nvidia/parakeet-tdt-0.6b-v2"
    )
    load_time = time.perf_counter() - load_start
    print(f"Parakeet loaded in {load_time:.2f} sec (not counted in per-turn latency).")

    # ---- Connect to Groq / Qwen ----
    groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
    print("Qwen (Groq) connection ready!")

    # ---- Connect to Cartesia ----
    cartesia_client = Cartesia(api_key=os.environ["CARTESIA_API_KEY"])
    print("Cartesia connected successfully!")

    conversation_history = []  # list of {"role": ..., "content": ...}, no system prompt inside

    print("\nKODA is ready! Start talking.")
    print("Say 'exit', 'quit', or 'stop' to end, or press Ctrl+C at any time.\n")

    turn_number = 0

    try:
        while True:
            turn_number += 1
            print(f"\n===== Turn {turn_number} =====")
            print("Listening... speak now.")

            turn_start = time.perf_counter()

            # ---------------- Recording with silence detection ----------------
            record_start = time.perf_counter()
            try:
                audio = record_until_silence()
            except Exception as e:
                print(f"[Error] Recording failed: {e}")
                continue
            record_latency = time.perf_counter() - record_start

            if audio is None:
                print("Didn't catch any speech — still listening...")
                continue

            try:
                sf.write("recording.wav", audio, SAMPLE_RATE)
            except Exception as e:
                print(f"[Error] Could not save recording: {e}")
                continue

            # ---------------- Parakeet: speech -> text ----------------
            try:
                parakeet_start = time.perf_counter()
                result = asr_model.transcribe(["recording.wav"])
                text = result[0].text.strip()
                parakeet_latency = time.perf_counter() - parakeet_start
            except Exception as e:
                print(f"[Error] Parakeet transcription failed: {e}")
                continue

            if not text:
                print("Heard only silence/noise — still listening...")
                continue

            print(f"You said: {text}")
            print(f"Parakeet latency: {parakeet_latency:.2f} sec")

            # ---------------- Check for exit phrase ----------------
            simplified = text.strip().lower().strip(".!? ")
            if simplified in EXIT_WORDS:
                print("Goodbye!")
                break

            # ---------------- Safety check + Qwen ----------------
            qwen_latency = 0.0
            answer_raw = ""

            if contains_crisis_language(text):
                print("[Safety] Crisis language detected in user speech. Skipping Qwen.")
                answer = CRISIS_RESPONSE
            else:
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                messages.extend(conversation_history[-(MAX_HISTORY_TURNS * 2):])
                messages.append({"role": "user", "content": text})

                try:
                    qwen_start = time.perf_counter()
                    response = groq_client.chat.completions.create(
                        model="qwen/qwen3.6-27b",
                        messages=messages,
                    )
                    answer_raw = response.choices[0].message.content.strip()
                    answer = clean_answer(answer_raw)
                    answer = make_answer_safe(answer)
                    qwen_latency = time.perf_counter() - qwen_start
                except Exception as e:
                    print(f"[Error] Qwen request failed: {e}")
                    answer = "Sorry, I had trouble thinking of an answer. Please try again."

            if not answer:
                answer = SAFE_FALLBACK

            if answer_raw:
                print(f"Qwen raw output: {answer_raw}")
            print(f"KODA: {answer}")
            print(f"Qwen latency: {qwen_latency:.2f} sec")

            # ---------------- Update conversation memory ----------------
            conversation_history.append({"role": "user", "content": text})
            conversation_history.append({"role": "assistant", "content": answer})
            conversation_history[:] = conversation_history[-(MAX_HISTORY_TURNS * 2):]

            # ---------------- Cartesia: text -> speech ----------------
            cartesia_latency = 0.0
            try:
                cartesia_start = time.perf_counter()
                cartesia_response = cartesia_client.tts.generate(
                    model_id="sonic-3.5",
                    transcript=answer,
                    voice={
                        "mode": "id",
                        "id": "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"
                    },
                    output_format={
                        "container": "wav",
                        "encoding": "pcm_s16le",
                        "sample_rate": 44100
                    },
                    language="en"
                )
                cartesia_response.write_to_file("qwen_answer.wav")
                cartesia_latency = time.perf_counter() - cartesia_start
            except Exception as e:
                print(f"[Error] Cartesia TTS failed: {e}")
                print("Skipping playback for this turn, listening again...")
                continue

            time_to_first_audio = time.perf_counter() - turn_start

            # ---------------- Playback ----------------
            play_latency = 0.0
            try:
                play_start = time.perf_counter()
                playsound("qwen_answer.wav")
                play_latency = time.perf_counter() - play_start
            except Exception as e:
                print(f"[Error] Audio playback failed: {e}")

            total_latency = time.perf_counter() - turn_start

            # ---------------- Latency report (this turn only) ----------------
            print("\n---- Latency report (this turn) ----")
            print(f"Recording (incl. silence wait): {record_latency:.2f} sec")
            print(f"Parakeet:                       {parakeet_latency:.2f} sec")
            print(f"Qwen:                            {qwen_latency:.2f} sec")
            print(f"Cartesia:                        {cartesia_latency:.2f} sec")
            print(f"Time to first audio:             {time_to_first_audio:.2f} sec")
            print(f"Audio playback:                  {play_latency:.2f} sec")
            print(f"TOTAL turn time:                 {total_latency:.2f} sec")
            print("-------------------------------------")

    except KeyboardInterrupt:
        print("\n\nKODA stopped (Ctrl+C). Goodbye!")


if __name__ == "__main__":
    main()