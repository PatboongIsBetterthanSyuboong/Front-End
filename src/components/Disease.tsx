"use client";

import styles from "./Disease.module.css";

export default function Disease() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>상병</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.diseaseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>주상병</th>
                <th>상병코드</th>
                <th>상병명칭</th>
                <th>구분(?)</th>
                <th>과목</th>
                <th>수술</th>
              </tr>
            </thead>
            <tbody>
              {/* className 이름 변경 필요 */}
              <tr className={styles.tableRow}>
                <td className={styles.patientNumber}></td>
                <td className={styles.entryTime}>A005</td>
                <td className={styles.patientName}>콜레라</td>
                <td className={styles.gender}>1</td>
                <td className={styles.birthDate}>05</td>
                <td className={styles.department}>O</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}