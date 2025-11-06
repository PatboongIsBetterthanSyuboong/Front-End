"use client";

import styles from "./AIReport.module.css";

export default function AIReport() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>AI 리포트</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.imagePlaceholder}>
            <p>이미지를 업로드하거나 선택하세요</p>
          </div>
        </div>
        
        <div className={styles.controlSection}>
          <button className={styles.uploadButton}>이미지 업로드</button>
          <button className={styles.analyzeButton}>AI 분석</button>
        </div>
        
        <div className={styles.resultSection}>
          <div className={styles.resultPlaceholder}>
            <p>AI 분석 결과가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

