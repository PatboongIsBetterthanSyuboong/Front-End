"use client";

import { useState, useRef } from "react";
import styles from "./AIReport.module.css";
import { uploadAndAnalyzeImage } from "@/services/radiology";

interface AIReportProps {
  patientId?: number;
  employeeId?: number;
  deptId?: number;
  entryDate?: string; // yyyy-MM-dd 형식
}

export default function AIReport({
  patientId,
  employeeId,
  deptId,
  entryDate,
}: AIReportProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // 파일 객체 저장
      selectedFileRef.current = file;

      // FileReader를 사용하여 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // 에러 초기화
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setResultImage(null);
    setAnalysisResult(null);
    setError(null);
    selectedFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage || !selectedFileRef.current) {
      alert("이미지를 먼저 업로드해주세요.");
      return;
    }

    // 필수 파라미터 확인
    if (!patientId || !employeeId || !deptId || !entryDate) {
      alert("환자 정보가 없습니다. 진료실에서 환자를 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const file = selectedFileRef.current;
      const response = await uploadAndAnalyzeImage(
        file,
        patientId,
        employeeId,
        deptId,
        entryDate
      );

      // 결과 이미지 URL 생성 (백엔드에서 반환된 상대 경로를 절대 URL로 변환)
      // Flask에서 반환하는 imageUrl은 "images/..." 또는 "Back-End/images/..." 형식
      // 스프링 백엔드는 /images/** 경로로 정적 리소스를 제공하므로 /images/... 형식으로 변환
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      let imageUrl: string | null = null;
      
      if (response.imageUrl) {
        // "Back-End/images/..." 또는 "Back-End/BitComputer/images/..." 형식이면 "images/..."로 변환
        let normalizedPath = response.imageUrl
          .replace(/^Back-End\/BitComputer\//, "")
          .replace(/^Back-End\//, "");
        
        // 이미 /images/로 시작하면 그대로 사용, 아니면 /images/ 추가
        if (!normalizedPath.startsWith("images/") && !normalizedPath.startsWith("/images/")) {
          normalizedPath = `images/${normalizedPath}`;
        }
        
        // URL 생성 (앞의 / 제거)
        normalizedPath = normalizedPath.replace(/^\//, "");
        imageUrl = `${baseUrl}/${normalizedPath}`;
        
        console.log("[DEBUG] 이미지 URL 변환:", {
          original: response.imageUrl,
          normalized: normalizedPath,
          final: imageUrl
        });
      }

      setResultImage(imageUrl || uploadedImage);
      setAnalysisResult(response.result ? "의심" : "이상 없음");
    } catch (err: any) {
      console.error("AI 분석 오류:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "AI 분석 중 오류가 발생했습니다.";
      setError(errorMessage);
      alert(`AI 분석 실패: ${errorMessage}`);
    } finally {
      setIsLoading(false);
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
            disabled={!uploadedImage || isLoading}
            onClick={handleAnalyze}
          >
            {isLoading ? "분석 중..." : "AI 분석"}
          </button>
        </div>

        {/* 결과 이미지 표시 영역 */}
        {resultImage && (
          <div className={styles.resultImageSection}>
            <div className={styles.imageContainer}>
              <img 
                src={resultImage} 
                alt="분석 결과 이미지" 
                className={styles.uploadedImage}
              />
            </div>
          </div>
        )}

        {/* 분석 결과 텍스트 영역 */}
        {analysisResult && (
          <div className={styles.resultTextSection}>
            <span className={styles.resultLabel}>분석 결과:</span>
            <span className={styles.resultValue}>{analysisResult}</span>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

