import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";

interface OnboardingState {
  isComplete: boolean;
  complete: () => void;
  hydrate: () => void;
}

function loadOnboarding(): boolean {
  try {
    return StorageService.onboarding.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE) ?? false;
  } catch {
    return false;
  }
}

export const useOnboardingStore = create<OnboardingState>(set => ({
  complete: () => {
    StorageService.onboarding.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    set({ isComplete: true });
  },
  hydrate: () => {
    const done = loadOnboarding();
    set({ isComplete: done });
  },
  isComplete: loadOnboarding(),
}));
