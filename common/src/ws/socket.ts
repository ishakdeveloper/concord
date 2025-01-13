import type { DbUser } from '@concord/server';
import type { PubSubEvents } from './events';
import { Opcodes } from './opcodes';

export type WSMessage = {
  op: Opcodes;
  d: any;
  s?: string;
  t?: string;
};

export type SocketConnection = {
  sendMessage: (message: WSMessage) => void;
  onMessage: <T = any>(
    event: PubSubEvents,
    callback: (data: T) => void
  ) => () => void;
  isConnected: boolean;
  user: DbUser | null;
  setUser: (user: DbUser | null) => void;
};
