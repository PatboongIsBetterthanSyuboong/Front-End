"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import styles from "./PatientForm.module.css";

export interface PatientFormRef {
  registerPatient: () => void;
}

const PatientForm = forwardRef<PatientFormRef>((props, ref) => {
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
    alert("환자 정보가 등록되었습니다!");
    // 폼 초기화
    setFormData({
      name: "",
      birthDate: "",
      phone: "",
      address: "",
      symptoms: "",
      notes: ""
    });
  };

  const registerPatient = () => {
    if (!formData.name || !formData.birthDate || !formData.phone) {
      alert("필수 정보(환자명, 생년월일, 연락처)를 입력해주세요.");
      return;
    }
    
    console.log("접수등록 버튼으로 환자 등록:", formData);
    alert(`${formData.name} 환자가 접수 등록되었습니다!`);
    
    // 폼 초기화
    setFormData({
      name: "",
      birthDate: "",
      phone: "",
      address: "",
      symptoms: "",
      notes: ""
    });
  };

  useImperativeHandle(ref, () => ({
    registerPatient
  }));

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
});

PatientForm.displayName = "PatientForm";

export default PatientForm;