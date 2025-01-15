import { useEffect, useRef, useState, useCallback } from 'react';
import { VOICE_EVENTS, VOICE_CONFIG, ICE_SERVERS } from '@concord/common';
import type { VoiceMessage, VoiceState } from '@concord/common';

interface UseVoiceConnectionProps {
  channelId: string;
  userId: string;
  onUserJoin?: (userId: string) => void;
  onUserLeave?: (userId: string) => void;
}

export function useVoiceConnection({
  channelId,
  userId,
  onUserJoin,
  onUserLeave,
}: UseVoiceConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [localMuted, setLocalMuted] = useState(false);
  const [localDeafened, setLocalDeafened] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Initialize WebSocket
      const ws = new WebSocket(process.env.NEXT_PUBLIC_VOICE_WS_URL!);
      wsRef.current = ws;

      // Initialize WebRTC
      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      });
      peerConnectionRef.current = pc;

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: VOICE_CONFIG.SAMPLE_RATE,
          channelCount: VOICE_CONFIG.CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      });
      localStreamRef.current = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Setup WebSocket handlers
      setupWebSocketHandlers(ws);

      // Setup WebRTC handlers
      setupPeerConnectionHandlers(pc);

      // Send join message
      ws.addEventListener('open', () => {
        ws.send(
          JSON.stringify({
            type: VOICE_EVENTS.JOIN,
            payload: { channelId, userId },
          })
        );
      });

      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  }, [channelId, userId]);

  const setupWebSocketHandlers = (ws: WebSocket) => {
    ws.onmessage = async (event) => {
      const message: VoiceMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'OFFER':
          await handleOffer(message.payload);
          break;
        case 'ANSWER':
          await handleAnswer(message.payload);
          break;
        case 'ICE':
          await handleIceCandidate(message.payload);
          break;
        // ... handle other message types
      }
    };
  };

  const setupPeerConnectionHandlers = (pc: RTCPeerConnection) => {
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: VOICE_EVENTS.ICE,
            payload: { candidate },
          })
        );
      }
    };

    pc.ontrack = (event) => {
      const audioContext = new AudioContext({
        sampleRate: VOICE_CONFIG.SAMPLE_RATE,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(event.streams[0]);
      const gainNode = audioContext.createGain();

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
    };
  };

  const handleOffer = async (payload: { sdp: RTCSessionDescriptionInit }) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    wsRef.current?.send(
      JSON.stringify({
        type: VOICE_EVENTS.ANSWER,
        payload: { sdp: answer },
      })
    );
  };

  const handleAnswer = async (payload: { sdp: RTCSessionDescriptionInit }) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
  };

  const handleIceCandidate = async (payload: {
    candidate: RTCIceCandidateInit;
  }) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch (err) {
      console.error('Error adding received ice candidate', err);
    }
  };

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;

    const newMuted = !localMuted;
    audioTrack.enabled = !newMuted;
    setLocalMuted(newMuted);

    wsRef.current?.send(
      JSON.stringify({
        type: VOICE_EVENTS.MUTE,
        payload: { muted: newMuted },
      })
    );
  }, [localMuted]);

  const toggleDeafen = useCallback(() => {
    if (!audioContextRef.current) return;

    const newDeafened = !localDeafened;
    if (newDeafened) {
      audioContextRef.current.suspend();
    } else {
      audioContextRef.current.resume();
    }
    setLocalDeafened(newDeafened);

    wsRef.current?.send(
      JSON.stringify({
        type: VOICE_EVENTS.DEAFEN,
        payload: { deafened: newDeafened },
      })
    );
  }, [localDeafened]);

  const cleanup = useCallback(() => {
    // Cleanup WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Cleanup WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Cleanup media streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Cleanup audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connect,
    disconnect: cleanup,
    toggleMute,
    toggleDeafen,
    isConnected,
    isConnecting,
    error,
    localMuted,
    localDeafened,
  };
}
