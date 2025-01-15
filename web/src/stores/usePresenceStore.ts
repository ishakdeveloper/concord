import { create } from 'zustand';

type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';

type PresenceStore = {
  status: PresenceStatus;
  setStatus: (status: PresenceStatus) => void;
};

export const usePresenceStore = create<PresenceStore>()((set) => ({
  status: 'online',
  setStatus: (status) => set({ status }),
}));
