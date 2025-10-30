"use client";

import { useState } from "react";
import styles from "./PatientForm.module.css";

export default function PatientForm() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    phone: "",
    address: "",
    symptoms: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("환자 정보:", formData);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>환자 정보 입력</h3>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>환자명</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
          
          <label className={styles.field}>
            <span className={styles.label}>생년월일</span>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
        </div>
        
        <label className={styles.field}>
          <span className={styles.label}>연락처</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            className={styles.input}
          />
        </label>
        
        <label className={styles.field}>
          <span className={styles.label}>주소</span>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
        
        <label className={styles.field}>
          <span className={styles.label}>증상</span>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows={3}
            className={styles.textarea}
          />
        </label>
        
        <button type="submit" className={styles.submitButton}>
          환자 등록
        </button>
      </form>
    </div>
  );
}