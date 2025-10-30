"use client";

import styles from "./ActionBar.module.css";

export default function ActionBar() {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className={styles.actionBar}>
      <div className={styles.leftSection}>
        <span className={styles.date}>{today}</span>
      </div>
      
      <div className={styles.rightSection}>
        <button className={`${styles.button} ${styles.registerButton}`}>
          접수등록
        </button>
        <button className={`${styles.button} ${styles.searchButton}`}>
          환자 조회
        </button>
      </div>
    </div>
  );
}