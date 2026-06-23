import { create } from "zustand";

type UnlockState = {
  open: boolean;
  show: () => void;
  hide: () => void;
};

export const useUnlock = create<UnlockState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
