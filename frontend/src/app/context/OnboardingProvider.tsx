import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  OnboardingContext,
  initialStep1,
  initialStep2,
  type OnboardingContextValue,
  type OnboardingStep1Data,
  type OnboardingStep2Data,
} from './onboarding';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step1, setStep1] = useState<OnboardingStep1Data>(initialStep1);
  const [step2, setStep2] = useState<OnboardingStep2Data>(initialStep2);

  const value = useMemo<OnboardingContextValue>(() => ({
    step1,
    step2,
    updateStep1: (data) => setStep1((current) => ({ ...current, ...data })),
    updateStep2: (data) => setStep2((current) => ({ ...current, ...data })),
    resetOnboarding: () => {
      setStep1(initialStep1);
      setStep2(initialStep2);
    },
  }), [step1, step2]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
