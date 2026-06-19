import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MedicalRecordsContext, type MedicalRecord, type MedicalRecordsContextValue } from './medicalRecords';

export function MedicalRecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const addRecord = useCallback((record: MedicalRecord) => {
    setRecords((current) => [record, ...current]);
  }, []);

  const updateRecord = useCallback((id: number, patch: Partial<MedicalRecord>) => {
    setRecords((current) => current.map((record) => (
      record.id === id ? { ...record, ...patch } : record
    )));
  }, []);

  const value = useMemo<MedicalRecordsContextValue>(() => ({
    records,
    addRecord,
    updateRecord,
  }), [records, addRecord, updateRecord]);

  return (
    <MedicalRecordsContext.Provider value={value}>
      {children}
    </MedicalRecordsContext.Provider>
  );
}
