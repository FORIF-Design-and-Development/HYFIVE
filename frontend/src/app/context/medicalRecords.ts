import { createContext } from 'react';

export type MedicalRecordType = '진료' | '예방접종' | '수술' | '건강검진' | '기타';

export interface MedicalRecord {
  id: number;
  date: string;
  hospital: string;
  type: MedicalRecordType;
  diagnosis: string;
  items: string;
  amount: string;
  memo: string;
  prescriptions: string[];
  attachments: string[];
}

export interface MedicalRecordsContextValue {
  records: MedicalRecord[];
  addRecord: (record: MedicalRecord) => void;
  updateRecord: (id: number, patch: Partial<MedicalRecord>) => void;
}

export const MedicalRecordsContext = createContext<MedicalRecordsContextValue | null>(null);
