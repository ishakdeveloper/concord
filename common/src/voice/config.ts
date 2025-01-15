export const VOICE_EVENTS = {
  JOIN: 'voice:join',
  LEAVE: 'voice:leave',
  OFFER: 'voice:offer',
  ANSWER: 'voice:answer',
  ICE: 'voice:ice',
  MUTE: 'voice:mute',
  DEAFEN: 'voice:deafen',
  SPEAKING: 'voice:speaking',
} as const;

export const VOICE_CONFIG = {
  SAMPLE_RATE: 48000,
  FRAME_SIZE: 480, // 10ms at 48kHz
  CHANNELS: 2,
  BITRATE: 64000,
} as const;

export const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
