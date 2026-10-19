from playsound3 import playsound
playsound("chatterbox_output.wav")

from chatterbox.tts import ChatterboxTTS
import torchaudio

print("Loading Chatterbox...")

model = ChatterboxTTS.from_pretrained(device="cpu")

text = "Hello! This is a test of Chatterbox text to speech."

print("Generating voice...")

wav = model.generate(text)

torchaudio.save("chatterbox_output.wav", wav, model.sr)

print("Done! Audio saved as chatterbox_output.wav")