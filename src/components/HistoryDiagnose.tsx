"use client";

import { useState } from "react";
import styles from "./HistoryDiagnose.module.css";

export default function HistoryDiagnose() {
  const [startDate, setStartDate] = useState("2024-10-30");
  const [endDate, setEndDate] = useState("2025-10-30");
  const [selectedPeriod, setSelectedPeriod] = useState("12개월");

  const periods = ["1개월", "3개월", "6개월", "12개월"];

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    const today = new Date();
    const startDate = new Date(today);
    
    switch (period) {
      case "1개월":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3개월":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "6개월":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "12개월":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }
    
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const diagnoseHistory = [
    {
      date: "25-10-28",
      hospital: "3진료실 (담당의: 최인우)",
      details: [
        { code: "중상", value: "1111111" },
        { code: "A010", value: "장티푸스", description: "Cholera due to Vibrio cholerae 01/ biovar cholera" },
        { code: "A000", value: "콜레라", description: "olerae 01/ biovar cholera e" },
        { code: "A022", value: "살모넬라 관절염(M01.3*)", description: "Salmonella arthritis(M01.3*)" },
        { code: "A013", value: "파라티푸스 C", description: "" },
        { code: "010", value: "기타 접촉자능성 결막염", description: "" },
        { code: "J111", value: "바이러스가 확인되지 않은/ 기타 호흡기증상을 동반한 인플루엔자", description: "" },
        { code: "A090", value: "감염성 기원의 기타 및 상세불명의 위장염 및 결장염", description: "" },
        { code: "AA254", value: "제진진찰료-의뢰/보건의료원 내 의과", description: "1" },
        { code: "MM010", value: "표층열치료", description: "1" },
        { code: "B1010", value: "일반혈액검사(CBC)-1일 구세포-장비측정_혈색소량비색법", description: "1" }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>과거처방</h3>
      
      {/* 날짜 선택 */}
      <div className={styles.dateSection}>
        <div className={styles.dateInputs}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
          <span className={styles.dateSeparator}>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
        
        {/* 기간 선택 버튼 */}
        <div className={styles.periodButtons}>
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodSelect(period)}
              className={`${styles.periodButton} ${selectedPeriod === period ? styles.active : ""}`}
            >
              {period}
            </button>
          ))}
          <button className={styles.searchButton}>
            조회
          </button>
        </div>
      </div>

      {/* 체크박스 옵션 */}
      <div className={styles.checkboxSection}>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>중상</span>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>상병</span>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>처방</span>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>모두 펼치기</span>
        </label>
      </div>

      {/* 진료 기록 */}
      <div className={styles.historyList}>
        {diagnoseHistory.map((record, index) => (
          <div key={index} className={styles.historyItem}>
            <div className={styles.historyHeader}>
              <span className={styles.historyDate}>{record.date}</span>
              <span className={styles.historyHospital}>{record.hospital}</span>
            </div>
            
            <div className={styles.detailsList}>
              {record.details.map((detail, detailIndex) => (
                <div key={detailIndex} className={styles.detailItem}>
                  <div className={styles.detailCode}>
                    {detail.code}
                  </div>
                  <div className={styles.detailContent}>
                    <div className={styles.detailValue}>{detail.value}</div>
                    {detail.description && (
                      <div className={styles.detailDescription}>{detail.description}</div>
                    )}
                  </div>
                  {detail.code.startsWith('AA') || detail.code.startsWith('MM') || detail.code.startsWith('B') ? (
                    <div className={styles.detailCount}>1</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}