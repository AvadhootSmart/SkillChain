import { create } from "zustand";

interface TransitionState {
  isTransitioning: boolean;
  duration: number; // ms
  startTransition: () => void;
  endTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  duration: 400,
  startTransition: () => set({ isTransitioning: true }),
  endTransition: () => set({ isTransitioning: false }),
}));
