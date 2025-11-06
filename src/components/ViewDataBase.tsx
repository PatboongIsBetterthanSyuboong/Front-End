"use client";

import styles from "./ViewDataBase.module.css";

export default function ViewDataBase() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>데이터베이스 조회</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="상병명 또는 진단명으로 검색" 
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>검색</button>
        </div>
        
        <div className={styles.tabSection}>
          <button className={`${styles.tab} ${styles.active}`}>상병</button>
          <button className={styles.tab}>진단</button>
        </div>
        
        <div className={styles.resultSection}>
          <div className={styles.resultList}>
            <div className={styles.resultItem}>
              <div className={styles.resultCode}>A00.0</div>
              <div className={styles.resultName}>콜레라</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultCode}>B00.9</div>
              <div className={styles.resultName}>헤르페스 감염</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultCode}>C78.0</div>
              <div className={styles.resultName}>폐의 속발성 악성 신생물</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

