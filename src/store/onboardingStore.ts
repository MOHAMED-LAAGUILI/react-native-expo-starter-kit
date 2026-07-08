import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";

interface OnboardingState {
  isComplete: boolean;
  complete: () => void;
  hydrate: () => void;
}

export const useOnboardingStore = create<OnboardingState>(set => ({
  complete: () => {
    StorageService.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    set({ isComplete: true });
  },
  hydrate: () => {
    const done = StorageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE) ?? false;
    set({ isComplete: done });
  },
  isComplete: false,
}));
