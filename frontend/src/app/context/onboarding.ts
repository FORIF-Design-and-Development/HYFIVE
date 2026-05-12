import { createContext } from 'react';

export type PetType = 'dog' | 'cat';
export type VaccineKey = 'dhppl' | 'rabies' | 'kennel' | 'corona' | 'heartworm' | 'parasite';

export interface OnboardingStep1Data {
  petType: PetType | null;
  name: string;
  breed: string;
  birthdate: string;
  gender: string;
  neutered: string;
  weight: string;
  photoFile: File | null;
}

export interface OnboardingStep2Data {
  vaccines: Record<VaccineKey, boolean>;
  lastCheckup: string;
  diseases: string;
}

export interface OnboardingState {
  step1: OnboardingStep1Data;
  step2: OnboardingStep2Data;
}

export interface OnboardingContextValue extends OnboardingState {
  updateStep1: (data: Partial<OnboardingStep1Data>) => void;
  updateStep2: (data: Partial<OnboardingStep2Data>) => void;
  resetOnboarding: () => void;
}

export const initialStep1: OnboardingStep1Data = {
  petType: null,
  name: '',
  breed: '',
  birthdate: '2021-03-15',
  gender: '수컷',
  neutered: '완료',
  weight: '',
  photoFile: null,
};

export const initialStep2: OnboardingStep2Data = {
  vaccines: {
    dhppl: true,
    rabies: true,
    kennel: false,
    corona: false,
    heartworm: false,
    parasite: false,
  },
  lastCheckup: '',
  diseases: '',
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);
