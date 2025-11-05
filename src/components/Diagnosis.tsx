"use client";

import styles from "./Diagnosis.module.css";

export default function Diagnosis() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>처방</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.diagnosisSection}>
          <div className={styles.inputGroup}>
            <label>주상병</label>
            <input type="text" placeholder="주상병을 입력하세요" />
          </div>
          <div className={styles.inputGroup}>
            <label>부상병</label>
            <input type="text" placeholder="부상병을 입력하세요" />
          </div>
          <div className={styles.inputGroup}>
            <label>진단 메모</label>
            <textarea placeholder="진단 관련 메모를 입력하세요" rows={4}></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}