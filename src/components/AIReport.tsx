"use client";

import { useState, useRef } from "react";
import styles from "./AIReport.module.css";

export default function AIReport() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // FileReader를 사용하여 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>AI 리포트</h3>
      </div>
      <div className={styles.content}>
        {/* 업로드된 이미지 표시 영역 */}
        <div className={styles.imageSection}>
          {uploadedImage ? (
            <div className={styles.imageContainer}>
              <img 
                src={uploadedImage} 
                alt="업로드된 이미지" 
                className={styles.uploadedImage}
              />
              <button 
                className={styles.removeButton}
                onClick={handleRemoveImage}
                aria-label="이미지 제거"
              >
                ×
              </button>
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              <p>이미지를 업로드하거나 선택하세요</p>
            </div>
          )}
        </div>
        
        <div className={styles.controlSection}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: "none" }}
          />
          <button 
            className={styles.uploadButton}
            onClick={handleUploadClick}
          >
            이미지 업로드
          </button>
          <button 
            className={styles.analyzeButton}
            disabled={!uploadedImage}
          >
            AI 분석
          </button>
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

