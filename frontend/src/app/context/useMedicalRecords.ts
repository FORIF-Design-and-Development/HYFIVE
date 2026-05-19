import { useContext } from 'react';
import { MedicalRecordsContext } from './medicalRecords';

export function useMedicalRecords() {
  const context = useContext(MedicalRecordsContext);

  if (!context) {
    throw new Error('useMedicalRecords must be used within MedicalRecordsProvider');
  }

  return context;
}
