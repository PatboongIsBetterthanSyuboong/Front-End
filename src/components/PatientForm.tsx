"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import styles from "./PatientForm.module.css";

export interface PatientFormRef {
  registerPatient: () => void;
}

interface PatientData {
  name: string;
  phoneNumber: string;
  identityNumber: string;
  birth: string;
  gender: string;
}

const PatientForm = forwardRef<PatientFormRef>((props, ref) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    phone: "",
    identityNumber: "",
    gender: "M",
    address: "",
    symptoms: "",
    notes: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const createPatient = async (patientData: PatientData): Promise<number | null> => {
    try {
      const response = await fetch('http://localhost:8080/api/patients/get_patient_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.patientId;
    } catch (error) {
      console.error('환자 등록 실패:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthDate || !formData.phone || !formData.identityNumber) {
      alert("필수 정보(환자명, 생년월일, 연락처, 주민등록번호)를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    
    try {
      const patientData: PatientData = {
        name: formData.name,
        phoneNumber: formData.phone,
        identityNumber: formData.identityNumber,
        birth: formData.birthDate,
        gender: formData.gender
      };

      const patientId = await createPatient(patientData);
      
      if (patientId) {
        alert(`환자 정보가 등록되었습니다! (환자 ID: ${patientId})`);
        // 폼 초기화
        setFormData({
          name: "",
          birthDate: "",
          phone: "",
          identityNumber: "",
          gender: "M",
          address: "",
          symptoms: "",
          notes: ""
        });
      }
    } catch (error) {
      alert("환자 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async () => {
    if (!formData.name || !formData.birthDate || !formData.phone || !formData.identityNumber) {
      alert("필수 정보(환자명, 생년월일, 연락처, 주민등록번호)를 입력해주세요.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const patientData: PatientData = {
        name: formData.name,
        phoneNumber: formData.phone,
        identityNumber: formData.identityNumber,
        birth: formData.birthDate,
        gender: formData.gender
      };

      const patientId = await createPatient(patientData);
      
      if (patientId) {
        alert(`${formData.name} 환자가 접수 등록되었습니다! (환자 ID: ${patientId})`);
        // 폼 초기화
        setFormData({
          name: "",
          birthDate: "",
          phone: "",
          identityNumber: "",
          gender: "M",
          address: "",
          symptoms: "",
          notes: ""
        });
      }
    } catch (error) {
      alert("환자 접수 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
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
            <span className={styles.label}>환자명 *</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>
          
          <label className={styles.field}>
            <span className={styles.label}>생년월일 *</span>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>
        </div>
        
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>연락처 *</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className={styles.input}
              required
            />
          </label>
          
          <label className={styles.field}>
            <span className={styles.label}>성별 *</span>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={styles.input}
              required
            >
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </label>
        </div>
        
        <label className={styles.field}>
          <span className={styles.label}>주민등록번호 *</span>
          <input
            type="text"
            name="identityNumber"
            value={formData.identityNumber}
            onChange={handleChange}
            placeholder="000000-0000000"
            className={styles.input}
            required
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
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "등록 중..." : "환자 등록"}
        </button>
      </form>
    </div>
  );
});

PatientForm.displayName = "PatientForm";

export default PatientForm;