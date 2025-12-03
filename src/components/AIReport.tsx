"use client";

import { useState, useRef } from "react";
import styles from "./AIReport.module.css";

interface AIReportProps {
  patientId?: number;
  employeeId?: number;
  deptId?: number;
  entryDate?: string; // "yyyy-MM-dd" 형식
}

export default function AIReport({ 
  patientId, 
  employeeId = 1, 
  deptId = 1,
  entryDate 
}: AIReportProps = {}) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    result: boolean;
    imageUrl: string | null;
    summary?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 확장자 확인 (JPG, JPEG, PNG, DICOM만 허용)
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.dcm', '.dicom'];
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert("JPG, JPEG, PNG, DICOM 파일만 업로드 가능합니다.");
        return;
      }

      // DICOM 파일은 미리보기를 생성하지 않음
      if (fileExtension === '.dcm' || fileExtension === '.dicom') {
        setUploadedImage(null);
        setUploadedFile(file);
        setAnalysisResult(null);
        setError(null);
        return;
      }

      // 이미지 파일의 경우 FileReader를 사용하여 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setUploadedFile(file);
        setAnalysisResult(null);
        setError(null);
      };
      reader.onerror = () => {
        // 미리보기 실패해도 파일은 업로드 가능
        setUploadedImage(null);
        setUploadedFile(file);
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      alert("이미지를 먼저 업로드하세요.");
      return;
    }

    if (!patientId) {
      alert("환자를 선택해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("patientId", patientId.toString());
      formData.append("employeeId", employeeId.toString());
      formData.append("deptId", deptId.toString());
      formData.append("entryDate", entryDate || new Date().toISOString().split("T")[0]);

      // API 호출
      const response = await fetch("http://localhost:8080/api/radiology/upload-and-analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP 오류! 상태 코드: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 상태 코드만 사용
          if (response.status === 401) {
            errorMessage = "인증이 필요합니다. 로그인해주세요.";
          } else if (response.status === 403) {
            errorMessage = "접근 권한이 없습니다.";
          } else if (response.status === 404) {
            errorMessage = "요청한 리소스를 찾을 수 없습니다.";
          } else if (response.status >= 500) {
            errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      setAnalysisResult({
        result: result.result,
        imageUrl: result.imageUrl ? `http://localhost:8080/${result.imageUrl}` : null,
        summary: result.summary,
      });
    } catch (err: any) {
      console.error("AI 분석 실패:", err);
      setError(err.message || "AI 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // entryDate가 없으면 오늘 날짜 사용
  const currentDate = entryDate || new Date().toISOString().split("T")[0];

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
              {analysisResult?.imageUrl ? (
                <img 
                  src={analysisResult.imageUrl} 
                  alt="AI 분석 결과 이미지" 
                  className={styles.uploadedImage}
                />
              ) : (
                <img 
                  src={uploadedImage} 
                  alt="업로드된 이미지" 
                  className={styles.uploadedImage}
                />
              )}
              <button 
                className={styles.removeButton}
                onClick={handleRemoveImage}
                aria-label="이미지 제거"
              >
                ×
              </button>
            </div>
          ) : uploadedFile ? (
            <div className={styles.imagePlaceholder}>
              <p>파일이 선택되었습니다: {uploadedFile.name}</p>
              <p className={styles.fileHint}>(DICOM 파일은 미리보기를 지원하지 않습니다)</p>
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              <p>이미지를 업로드하거나 선택하세요</p>
              <p className={styles.fileHint}>(JPG, JPEG, PNG, DICOM 지원)</p>
            </div>
          )}
        </div>
        
        <div className={styles.controlSection}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.dcm,.dicom"
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
            disabled={!uploadedFile || isAnalyzing || !patientId}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? "분석 중..." : "AI 분석"}
          </button>
        </div>
        
        <div className={styles.resultSection}>
          {error && (
            <div className={styles.errorMessage}>
              <p>오류: {error}</p>
            </div>
          )}
          {analysisResult && (
            <div className={styles.resultContent}>
              <div className={styles.resultItem}>
                <strong>분석 결과:</strong>{" "}
                <span className={analysisResult.result ? styles.anomaly : styles.normal}>
                  {analysisResult.result ? "의심" : "이상 없음"}
                </span>
              </div>
              {analysisResult.summary && (
                <div className={styles.resultItem}>
                  <strong>요약:</strong> {analysisResult.summary}
                </div>
              )}
            </div>
          )}
          {!analysisResult && !error && (
            <div className={styles.resultPlaceholder}>
              <p>AI 분석 결과가 여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
