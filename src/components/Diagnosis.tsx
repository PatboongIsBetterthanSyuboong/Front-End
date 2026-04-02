"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMedicalSelection } from "@store/medicalSelection";
import styles from "./Diagnosis.module.css";
import { ClinicVisitContext } from "@/types/clinic";
import { setHistoryDiagnoses } from "@/services/history";

type DiagnosisProps = {
  clinicVisit: ClinicVisitContext | null;
  ensureHistory: () => Promise<number>;
  employeeId: number;
  onHistoryUpdated?: () => void;
};

export default function Diagnosis({ clinicVisit, ensureHistory, employeeId, onHistoryUpdated }: DiagnosisProps) {
  const { diagnoses, removeDiagnosis, clearDiagnoses } = useMedicalSelection();
  const [saving, setSaving] = useState(false);
  const prevPatientIdRef = useRef<number | null>(null);

  useEffect(() => {
    const currentPatientId = clinicVisit?.patientId ?? null;
    if (prevPatientIdRef.current !== currentPatientId) {
      prevPatientIdRef.current = currentPatientId;
      clearDiagnoses();
    }
  }, [clinicVisit?.patientId, clearDiagnoses]);

  const handleSave = useCallback(async () => {
    if (!clinicVisit) {
      alert("환자를 먼저 선택해주세요.");
      return;
    }

    if (diagnoses.length === 0) {
      return;
    }

    setSaving(true);
    try {
      const historyId = await ensureHistory();
      await setHistoryDiagnoses(
        historyId,
        employeeId,
        diagnoses.map((item) => ({
          id: item.id,
        }))
      );
      onHistoryUpdated?.();
      alert("처방 정보가 저장되었습니다.");
    } catch (error) {
      console.error("처방 정보 저장 실패:", error);
      alert("처방 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }, [clinicVisit, diagnoses, employeeId, ensureHistory]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>처방</h3>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButtonAI}
            onClick={() => {}}
          >
            AI 생성
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={handleSave}
            disabled={diagnoses.length === 0 || saving}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            className={styles.controlButtonSecondary}
            onClick={clearDiagnoses}
            disabled={diagnoses.length === 0}
          >
            전체 삭제
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.diseaseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>No.</th>
                <th>ID</th>
                <th>코드</th>
                <th>처방명</th>
                <th>투여량</th>
                <th>횟수</th>
                <th>일수</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.length === 0 ? (
                <tr className={styles.tableRow}>
                  <td colSpan={8} className={styles.emptyRow}>
                    선택된 처방이 없습니다. 오른쪽 데이터베이스에서 더블클릭하여 추가하세요.
                  </td>
                </tr>
              ) : (
                diagnoses.map((item, index) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.sequence}>{index + 1}</td>
                    <td className={styles.identifier}>{item.id}</td>
                    <td className={styles.code}>{item.code}</td>
                    <td className={styles.name}>{item.name}</td>
                    <td className={styles.dose}>{item.dose}</td>
                    <td className={styles.time}>{item.time}</td>
                    <td className={styles.days}>{item.days}</td>
                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeDiagnosis(item.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}