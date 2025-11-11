"use client";

import { useCallback } from "react";
import { useMedicalSelection } from "@store/medicalSelection";
import styles from "./Disease.module.css";

export default function Disease() {
  const { diseases, removeDisease, clearDiseases } = useMedicalSelection();

  const handleSave = useCallback(() => {
    console.log("Saving diseases", diseases);
    alert("상병 정보가 저장되었습니다. (Demo)");
  }, [diseases]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>상병</h3>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={handleSave}
            disabled={diseases.length === 0}
          >
            저장
          </button>
          <button
            type="button"
            className={styles.controlButtonSecondary}
            onClick={clearDiseases}
            disabled={diseases.length === 0}
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
                <th>상병코드</th>
                <th>상병명칭</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {diseases.length === 0 ? (
                <tr className={styles.tableRow}>
                  <td colSpan={5} className={styles.emptyRow}>
                    선택된 상병이 없습니다. 오른쪽 데이터베이스에서 더블클릭하여 추가하세요.
                  </td>
                </tr>
              ) : (
                diseases.map((item, index) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.sequence}>{index + 1}</td>
                    <td className={styles.identifier}>{item.id}</td>
                    <td className={styles.code}>{item.code}</td>
                    <td className={styles.name}>{item.name}</td>
                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeDisease(item.id)}
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