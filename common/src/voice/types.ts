import { VOICE_EVENTS } from './config';

export interface VoiceMessage {
  type: keyof typeof VOICE_EVENTS;
  payload: any;
}

export interface VoiceState {
  channelId: string;
  userId: string;
  muted: boolean;
  deafened: boolean;
  speaking: boolean;
}

export interface AudioMessage {
  channelId: string;
  userId: string;
  samples: Int16Array;
}
