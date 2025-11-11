"use client";

import { useCallback } from "react";
import { useMedicalSelection } from "@store/medicalSelection";
import styles from "./Diagnosis.module.css";

export default function Diagnosis() {
  const { diagnoses, removeDiagnosis, clearDiagnoses } = useMedicalSelection();

  const handleSave = useCallback(() => {
    console.log("Saving diagnoses", diagnoses);
    alert("처방 정보가 저장되었습니다. (Demo)");
  }, [diagnoses]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>처방</h3>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={handleSave}
            disabled={diagnoses.length === 0}
          >
            저장
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