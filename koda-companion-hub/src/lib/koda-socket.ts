/**
 * Stubbed WebSocket layer for the future FastAPI backend.
 *
 * Replace the simulated timers with a real `new WebSocket(url)` connection.
 * The public surface (connect / send / on* callbacks / disconnect) is what the
 * UI depends on, so the components will not need to change.
 */

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

export type SocketHandlers = {
  onStateChange?: (state: VoiceState) => void;
  onLevel?: (level: number) => void;
  onChildTranscript?: (text: string) => void;
  onKodaTranscript?: (text: string) => void;
};

export type KodaSocket = {
  send: (payload: unknown) => void;
  disconnect: () => void;
};

/** Stub: would open ws://<host>/ws/session and stream mic audio frames. */
export function connectKodaSocket(_url: string, handlers: SocketHandlers): KodaSocket {
  handlers.onStateChange?.("idle");

  return {
    send: (payload) => {
      // TODO: socket.send(JSON.stringify(payload))
      void payload;
    },
    disconnect: () => {
      // TODO: socket.close()
    },
  };
}
