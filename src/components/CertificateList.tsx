"use client";

import styles from "./CertificateList.module.css";

export interface CertificateItem {
  id: number;
  patientNumber: string;
  patientName: string;
  age: number;
  department: string;
  doctor: string;
  issueDate: string;
}

interface CertificateListProps {
  selected: CertificateItem | null;
  onSelect: (item: CertificateItem) => void;
}

// TODO: API 연동 시 교체
const MOCK_CERTIFICATES: CertificateItem[] = [];

export default function CertificateList({ selected, onSelect }: CertificateListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>진단서 목록</h3>
        <span className={styles.count}>{MOCK_CERTIFICATES.length}건</span>
      </div>

      <div className={styles.body}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>환자번호</th>
                <th>이름</th>
                <th>나이</th>
                <th>진료과</th>
                <th>진료의</th>
                <th>발급일</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CERTIFICATES.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    조회 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                MOCK_CERTIFICATES.map((item) => (
                  <tr
                    key={item.id}
                    className={`${styles.row} ${selected?.id === item.id ? styles.selectedRow : ""}`}
                    onClick={() => onSelect(item)}
                  >
                    <td>{item.patientNumber}</td>
                    <td>{item.patientName}</td>
                    <td>{item.age}</td>
                    <td>{item.department}</td>
                    <td>{item.doctor}</td>
                    <td>{item.issueDate}</td>
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
