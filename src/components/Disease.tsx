"use client";

import styles from "./Disease.module.css";

export default function Disease() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>상병</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.diseaseSection}>
          <div className={styles.searchSection}>
            <input 
              type="text" 
              placeholder="질병명 또는 코드로 검색" 
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>검색</button>
          </div>
          
          <div className={styles.diseaseList}>
            <div className={styles.diseaseItem}>
              <div className={styles.diseaseCode}>A00.0</div>
              <div className={styles.diseaseName}>콜레라</div>
            </div>
            <div className={styles.diseaseItem}>
              <div className={styles.diseaseCode}>B00.9</div>
              <div className={styles.diseaseName}>헤르페스 감염</div>
            </div>
            <div className={styles.diseaseItem}>
              <div className={styles.diseaseCode}>C78.0</div>
              <div className={styles.diseaseName}>폐의 속발성 악성 신생물</div>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}