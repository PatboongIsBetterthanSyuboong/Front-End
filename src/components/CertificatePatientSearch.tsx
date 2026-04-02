"use client";

import { useState } from "react";
import styles from "./CertificatePatientSearch.module.css";

const DEPARTMENTS = ["검진", "내과", "정형외과"];
const DOCTORS = ["김의사", "이의사", "박의사"];

export default function CertificatePatientSearch() {
  const [patientNumber, setPatientNumber] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");

  const handleSearch = () => {
    // TODO: API 연동
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
            placeholder="환자번호 입력"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>이름</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>나이</label>
          <input
            type="number"
            className={styles.input}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="나이 입력"
            min={0}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>진료과</label>
          <select
            className={styles.select}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">전체</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>진료의</label>
          <select
            className={styles.select}
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
          >
            <option value="">전체</option>
            {DOCTORS.map((doc) => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>처방일자</label>
          <input
            type="date"
            className={styles.input}
            value={prescriptionDate}
            onChange={(e) => setPrescriptionDate(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={styles.searchButton}
          onClick={handleSearch}
        >
          조회
        </button>
      </div>
    </div>
  );
}
