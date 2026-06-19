import { createContext } from 'react';

export type PetType = 'DOG' | 'CAT';
export type PetGender = 'MALE' | 'FEMALE';
export type VaccineCode =
  | 'DHPPL'
  | 'RABIES'
  | 'KENNEL_COUGH'
  | 'CORONA_ENTERITIS'
  | 'HEARTWORM'
  | 'PARASITE';

export interface OnboardingStep1Data {
  petType: PetType | null;
  name: string;
  breed: string;
  birthdate: string;
  gender: PetGender | null;
  isNeutered: boolean | null;
  weight: string;
  photoFile: File | null;
}

export interface OnboardingStep2Data {
  vaccines: Record<VaccineCode, boolean>;
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
  gender: 'MALE',
  isNeutered: true,
  weight: '',
  photoFile: null,
};

export const initialStep2: OnboardingStep2Data = {
  vaccines: {
    DHPPL: true,
    RABIES: true,
    KENNEL_COUGH: false,
    CORONA_ENTERITIS: false,
    HEARTWORM: false,
    PARASITE: false,
  },
  lastCheckup: '',
  diseases: '',
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);
