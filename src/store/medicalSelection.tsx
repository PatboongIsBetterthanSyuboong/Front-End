"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface DiseaseSelection {
  id: number;
  code: string;
  name: string;
}

export interface DiagnosisSelection {
  id: number;
  code: string;
  name: string;
  dose: number;
  time: number;
  days: number;
  reason?: string;
}

interface MedicalSelectionContextValue {
  diseases: DiseaseSelection[];
  diagnoses: DiagnosisSelection[];
  addDisease: (item: DiseaseSelection) => void;
  addDiagnosis: (item: DiagnosisSelection) => void;
  removeDisease: (id: number) => void;
  removeDiagnosis: (id: number) => void;
  clearDiseases: () => void;
  clearDiagnoses: () => void;
  /** 타임라인 등에서 특정 내원의 저장된 상병·처방을 통째로 불러올 때 사용 */
  replaceDiseases: (items: DiseaseSelection[]) => void;
  replaceDiagnoses: (items: DiagnosisSelection[]) => void;
}

const MedicalSelectionContext = createContext<MedicalSelectionContextValue | null>(null);

export function MedicalSelectionProvider({ children }: { children: ReactNode }) {
  const [diseases, setDiseases] = useState<DiseaseSelection[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisSelection[]>([]);

  const addDisease = useCallback((item: DiseaseSelection) => {
    setDiseases((prev) => {
      const index = prev.findIndex((d) => d.id === item.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = item;
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const addDiagnosis = useCallback((item: DiagnosisSelection) => {
    setDiagnoses((prev) => {
      const index = prev.findIndex((d) => d.id === item.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = item;
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeDisease = useCallback((id: number) => {
    setDiseases((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removeDiagnosis = useCallback((id: number) => {
    setDiagnoses((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearDiseases = useCallback(() => {
    setDiseases([]);
  }, []);

  const clearDiagnoses = useCallback(() => {
    setDiagnoses([]);
  }, []);

  const replaceDiseases = useCallback((items: DiseaseSelection[]) => {
    setDiseases(items);
  }, []);

  const replaceDiagnoses = useCallback((items: DiagnosisSelection[]) => {
    setDiagnoses(items);
  }, []);

  const value = useMemo<MedicalSelectionContextValue>(
    () => ({
      diseases,
      diagnoses,
      addDisease,
      addDiagnosis,
      removeDisease,
      removeDiagnosis,
      clearDiseases,
      clearDiagnoses,
      replaceDiseases,
      replaceDiagnoses,
    }),
    [
      diseases,
      diagnoses,
      addDisease,
      addDiagnosis,
      removeDisease,
      removeDiagnosis,
      clearDiseases,
      clearDiagnoses,
      replaceDiseases,
      replaceDiagnoses,
    ]
  );

  return <MedicalSelectionContext.Provider value={value}>{children}</MedicalSelectionContext.Provider>;
}

export function useMedicalSelection() {
  const ctx = useContext(MedicalSelectionContext);
  if (!ctx) {
    throw new Error("useMedicalSelection must be used within a MedicalSelectionProvider");
  }
  return ctx;
}


