"use client";

import { useState } from "react";
import styles from "./CertificatePatientSearch.module.css";
import { getAllPatients, getPatientById } from "@services/certificate";
import type { PatientDTO } from "@services/certificate";

export interface CertificatePatientInfo {
  patientId: number;
  patientNumber: string;
  patientName: string;
  identityNumber: string;
  birth: string;
  gender: string;
}

interface Props {
  onPatientFound: (patient: CertificatePatientInfo) => void;
}

export default function CertificatePatientSearch({ onPatientFound }: Props) {
  const [patientNumber, setPatientNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<CertificatePatientInfo | null>(null);

  const handleSearch = async () => {
    const trimmed = patientNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setFound(null);

    try {
      // 1. 전체 환자 목록에서 입력값과 일치하는 환자 찾기
      //    - 숫자면 patient.id 와 비교, 아니면 identityNumber 와 비교
      const allPatients = await getAllPatients();
      const isNumeric = /^\d+$/.test(trimmed);
      let matched: PatientDTO | undefined;

      if (isNumeric) {
        matched = allPatients.find((p) => String(p.id) === trimmed);
      } else {
        matched = allPatients.find((p) => p.identityNumber === trimmed);
      }

      if (!matched) {
        setError("해당 환자번호로 조회된 환자가 없습니다.");
        return;
      }

      // 2. 상세 조회로 최신 정보 확인 (실패하면 get_all 결과 그대로 사용)
      let detail: PatientDTO = matched;
      try {
        detail = await getPatientById(matched.id);
      } catch {
        // get_all 결과 그대로 사용
      }

      const info: CertificatePatientInfo = {
        patientId: detail.id,
        patientNumber: String(detail.id),
        patientName: detail.name,
        identityNumber: detail.identityNumber ?? "",
        birth: detail.birth ?? "",
        gender: detail.gender ?? "",
      };

      setFound(info);
      onPatientFound(info);
    } catch {
      setError("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>환자 조회</h3>
      </div>

      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label}>환자번호</label>
          <input
            type="text"
            className={styles.input}
            value={patientNumber}
            onChange={(e) => setPatientNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="환자번호 입력"
          />
        </div>

        <button
          type="button"
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={loading || !patientNumber.trim()}
        >
          {loading ? "조회 중…" : "조회"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {found && (
          <div className={styles.result}>
            <p className={styles.resultTitle}>조회 결과</p>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>환자번호</span>
              <span className={styles.resultValue}>{found.patientNumber}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>성명</span>
              <span className={styles.resultValue}>{found.patientName}</span>
            </div>
            {found.identityNumber && (
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>주민번호</span>
                <span className={styles.resultValue}>{found.identityNumber}</span>
              </div>
            )}
            {found.birth && (
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>생년월일</span>
                <span className={styles.resultValue}>{found.birth}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
