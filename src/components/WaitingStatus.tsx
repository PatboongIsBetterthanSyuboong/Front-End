"use client";

import { useState } from "react";
import styles from "./WaitingStatus.module.css";

export default function WaitingStatus() {
  const [selectedStatus, setSelectedStatus] = useState("대기");

  const statusData = [
    { status: "진료 대기", count: 5, type: "waiting", filterStatus: "대기" },
    { status: "진료 보류", count: 2, type: "hold", filterStatus: "보류" },
    { status: "진료 완료", count: 12, type: "completed", filterStatus: "완료" },
  ];

  const allPatients = [
    { id: 1, name: "김철수", time: "09:30", status: "대기", type: "waiting" },
    { id: 2, name: "이영희", time: "10:00", status: "대기", type: "waiting" },
    { id: 3, name: "박민수", time: "10:30", status: "보류", type: "hold" },
    { id: 4, name: "최영수", time: "11:00", status: "대기", type: "waiting" },
    { id: 5, name: "정미영", time: "11:30", status: "완료", type: "completed" },
    { id: 6, name: "홍길동", time: "12:00", status: "완료", type: "completed" },
    { id: 7, name: "김영희", time: "12:30", status: "보류", type: "hold" },
    { id: 8, name: "박철민", time: "13:00", status: "대기", type: "waiting" },
    { id: 9, name: "이수진", time: "13:30", status: "대기", type: "waiting" },
  ];

  const handleStatusClick = (filterStatus: string) => {
    setSelectedStatus(filterStatus);
  };

  const filteredPatients = allPatients.filter(
    (patient) => patient.status === selectedStatus
  );

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>진료 현황</h3>

      {/* 상태 요약 */}
      <div className={styles.statusGrid}>
        {statusData.map((item) => (
          <button
            key={item.status}
            onClick={() => handleStatusClick(item.filterStatus)}
            className={`${styles.statusButton} ${styles[item.type]} ${
              selectedStatus === item.filterStatus ? styles.active : ""
            }`}
          >
            <div className={`${styles.statusCount} ${styles[item.type]}`}>
              {item.count}
            </div>
            <div className={styles.statusLabel}>{item.status}</div>
          </button>
        ))}
      </div>

      {/* 필터링된 환자 목록 */}
      <div>
        <h4 className={styles.sectionTitle}>
          {selectedStatus === "대기"
            ? "대기 환자"
            : selectedStatus === "보류"
            ? "보류 환자"
            : "완료 환자"}
          ({filteredPatients.length}명)
        </h4>
        <div className={styles.patientList}>
          {filteredPatients.map((patient) => (
            <div key={patient.id} className={styles.patientItem}>
              <span>{patient.name}</span>
              <div className={styles.patientInfo}>
                <span className={styles.patientTime}>{patient.time}</span>
                <span
                  className={`${styles.statusBadge} ${styles[patient.type]}`}
                >
                  {patient.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className={styles.emptyMessage}>
            {selectedStatus} 상태의 환자가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}