"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas";
import { setAccessToken, setRefreshToken } from "@/lib/auth/token";
import {
  type DocumentFeedbackType,
  generateDocumentCertificate,
  HttpError,
  saveDocumentCertificate,
} from "@/services";
import { getHistoryDiagnoses, getHistoryDiseases } from "@/services/history";
import styles from "./MedicalCertificate.module.css";
import { CertificateItem, CertificateType } from "./CertificateList";
import type { CertificatePatientInfo } from "./CertificatePatientSearch";

interface FieldConfig {
  id: string;
  label: string;
  top: string;
  left: string;
  width: string;
  multiline?: boolean;
  rows?: number;
}

type FieldValues = Record<string, string>;

/** AI 미리보기 모달에서 수락·거절 후 저장 시 APPROVE/REJECT/MODIFY 판단에 사용 */
type AiModalResolution =
  | { accepted: true; proposedText: string }
  | { accepted: false };

function isAuthTokenEnvelope(data: unknown): data is {
  accessToken?: string;
  refreshToken?: string;
  grantType?: string;
} {
  if (typeof data !== "object" || data === null) return false;
  return typeof (data as { accessToken?: unknown }).accessToken === "string";
}

/** 저장 API가 JWT 묶음만 주는 경우 모달에 토큰을 노출하지 않음 */
function applySaveResponseTokens(data: unknown): void {
  if (!isAuthTokenEnvelope(data)) return;
  if (data.accessToken) setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
}

function formatSaveResultPayload(data: unknown): string {
  if (data == null || data === "") return "저장이 완료되었습니다.";
  if (typeof data === "string") return data;
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  if (isAuthTokenEnvelope(data)) {
    return "저장이 완료되었습니다.";
  }
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "저장이 완료되었습니다.";
  }
}

/** 로컬 기준 `YYYY년 MM월 DD일` (진단일·발급일 등) */
function formatKoreanDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${d}일`;
}

const FIELD_CONFIGS: Record<CertificateType, FieldConfig[]> = {
  general: [
    { id: "patientName",  label: "성명",           top: "18.7%", left: "24%",  width: "180px" },
    { id: "patientId",    label: "환자번호",        top: "11.4%", left: "24%",  width: "70px" },
    { id: "idNumber",     label: "주민등록번호",    top: "18.7%", left: "64.5%",  width: "160px" },
    { id: "diagnosis",    label: "병명(상병명)",    top: "30%", left: "26%",  width: "320px" },
    { id: "opinion",      label: "향후 치료 소견",  top: "50%",   left: "24%",  width: "65%", multiline: true, rows: 7 },
    { id: "diagnosisDate",    label: "진단일",          top: "46.2%",   left: "64.5%",  width: "160px" },
    { id: "issueDate",    label: "발급일",          top: "80.5%",   left: "63%",  width: "160px" },
  ],
  military: [
    // 나중에 추가
  ],
};

/** 환자 정보에서 필드 ID로 자동 채울 수 있는 매핑 */
const PATIENT_FIELD_MAP: Partial<Record<string, keyof CertificatePatientInfo>> = {
  patientName:  "patientName",
  patientId:    "patientNumber",
  idNumber:     "identityNumber",
};

export interface CertificateDiagnosisApply {
  key: number;
  text: string;
  historyId: number;
}

interface MedicalCertificateProps {
  selected: CertificateItem | null;
  patientInfo: CertificatePatientInfo | null;
  employeeId: number;
  /** 상병 패널에서 보낸 적용 요청; `key`가 바뀔 때마다 병명(상병명) 필드에 반영 */
  diagnosisApply?: CertificateDiagnosisApply | null;
}

export default function MedicalCertificate({
  selected,
  patientInfo,
  employeeId,
  diagnosisApply = null,
}: MedicalCertificateProps) {
  const [fieldValues, setFieldValues] = useState<Record<CertificateType, FieldValues>>({
    general: {},
    military: {},
  });
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [noticeModal, setNoticeModal] = useState<string | null>(null);
  const [aiPreviewModal, setAiPreviewModal] = useState<{ text: string } | null>(null);
  const [resolvedAiRound, setResolvedAiRound] = useState<AiModalResolution | null>(null);
  const fieldsLayerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAiPreviewModal(null);
    setResolvedAiRound(null);
  }, [patientInfo?.patientId, selected?.id, diagnosisApply?.historyId]);

  // 진단서 종류 선택 시 진단일·발급일을 오늘(로컬) 날짜로 채움
  useEffect(() => {
    if (!selected) return;
    const configs = FIELD_CONFIGS[selected.type];
    const today = formatKoreanDate(new Date());
    const patch: FieldValues = {};
    if (configs.some((f) => f.id === "diagnosisDate")) patch.diagnosisDate = today;
    if (configs.some((f) => f.id === "issueDate")) patch.issueDate = today;
    if (Object.keys(patch).length === 0) return;
    setFieldValues((prev) => ({
      ...prev,
      [selected.type]: { ...prev[selected.type], ...patch },
    }));
  }, [selected]);

  // 환자 정보가 들어오면 PDF가 로드된 타입의 필드를 자동으로 채움
  useEffect(() => {
    if (!patientInfo || !selected) return;

    const fields = FIELD_CONFIGS[selected.type];
    const autoFilled: FieldValues = {};

    fields.forEach(({ id }) => {
      const patientKey = PATIENT_FIELD_MAP[id];
      if (patientKey) {
        const value = patientInfo[patientKey];
        if (value) autoFilled[id] = String(value);
      }
    });

    if (Object.keys(autoFilled).length === 0) return;

    setFieldValues((prev) => ({
      ...prev,
      [selected.type]: { ...prev[selected.type], ...autoFilled },
    }));
  }, [patientInfo, selected]);

  useEffect(() => {
    if (!diagnosisApply || !selected) return;
    const configs = FIELD_CONFIGS[selected.type];
    if (!configs.some((f) => f.id === "diagnosis")) return;
    setFieldValues((prev) => ({
      ...prev,
      [selected.type]: { ...prev[selected.type], diagnosis: diagnosisApply.text },
    }));
  }, [diagnosisApply, selected]);

  const handleChange = (type: CertificateType, fieldId: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [type]: { ...prev[type], [fieldId]: value },
    }));
  };

  const handleAiGenerate = async () => {
    if (!selected) return;
    const historyId = diagnosisApply?.historyId;
    if (historyId == null) {
      setNoticeModal("진단서에 상병을 먼저 적용해 주세요.");
      return;
    }
    const configs = FIELD_CONFIGS[selected.type];
    if (!configs.some((f) => f.id === "opinion")) {
      setNoticeModal("이 진단서 유형에는 향후 치료 소견 필드가 없습니다.");
      return;
    }
    setAiGenerating(true);
    try {
      const [diseases, diagnoses] = await Promise.all([
        getHistoryDiseases(historyId, employeeId),
        getHistoryDiagnoses(historyId, employeeId),
      ]);
      const diseaseCode = diseases
        .map((item) => item.code.trim())
        .filter(Boolean)
        .join(",");
      const prescriptionCode = diagnoses
        .map((item) => item.code.trim())
        .filter(Boolean)
        .join(",");
      const prescriptionName = diagnoses
        .map((item) => item.name.trim())
        .filter(Boolean)
        .join(",");

      const res = await generateDocumentCertificate({
        diseaseCode,
        prescriptionCode,
        prescriptionName,
      });
      const text = res.medicalCertificate ?? res.medical_certificate ?? "";
      setResolvedAiRound(null);
      setAiPreviewModal({ text });
    } catch (error: unknown) {
      console.error("AI 문서 생성 실패", error);
      if (error instanceof HttpError) {
        setNoticeModal(
          `AI 생성에 실패했습니다. [${error.status}] ${error.message}`
        );
      } else {
        setNoticeModal("AI 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selected || !fieldsLayerRef.current || !wrapperRef.current) return;
    const historyId = diagnosisApply?.historyId;
    if (historyId == null) {
      setNoticeModal("진단서에 상병을 먼저 적용해 주세요.");
      return;
    }

    if (aiPreviewModal != null) {
      setNoticeModal("AI 생성 내용에 먼저 수락 또는 거절을 선택해 주세요.");
      return;
    }

    const savedMedicalCertificate =
      fieldValues[selected.type].opinion ?? "";

    let agentUsed = false;
    let originalMedicalCertificate = "";
    let feedbackType: DocumentFeedbackType;

    if (resolvedAiRound == null) {
      feedbackType = "NONE";
    } else if (!resolvedAiRound.accepted) {
      feedbackType = "REJECT";
    } else {
      agentUsed = true;
      originalMedicalCertificate = resolvedAiRound.proposedText;
      feedbackType =
        savedMedicalCertificate.trim() ===
        resolvedAiRound.proposedText.trim()
          ? "APPROVE"
          : "MODIFY";
    }

    setSaving(true);
    try {
      const canvas = await html2canvas(fieldsLayerRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        onclone: (_doc, cloned) => {
          cloned.querySelectorAll<HTMLElement>("input, textarea").forEach((el) => {
            el.style.background = "transparent";
            el.style.border = "none";
            el.style.boxShadow = "none";
            el.style.outline = "none";
            el.style.padding = "0";
          });
        },
      });
      const pngDataUrl = canvas.toDataURL("image/png");
      const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());

      const pdfBytes = await fetch(selected.pdfPath).then((r) => r.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      const pngImage = await pdfDoc.embedPng(pngBytes);
      page.drawImage(pngImage, { x: 0, y: 0, width, height });

      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const pdfFile = new File([blob], `${selected.label}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("historyId", String(historyId));
      formData.append("pdfFile", pdfFile);
      formData.append("agentUsed", String(agentUsed));
      formData.append("originalMedicalCertificate", originalMedicalCertificate);
      formData.append("savedMedicalCertificate", savedMedicalCertificate);
      formData.append("feedbackType", feedbackType);

      const result = await saveDocumentCertificate(formData);
      applySaveResponseTokens(result);
      setNoticeModal(formatSaveResultPayload(result));
    } catch (error: unknown) {
      console.error("진단서 저장 실패", error);
      if (error instanceof HttpError) {
        setNoticeModal(
          `저장에 실패했습니다. [${error.status}] ${error.message}`
        );
      } else {
        setNoticeModal("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAiPreviewAccept = () => {
    if (!selected || !aiPreviewModal) return;
    const proposedText = aiPreviewModal.text;
    setFieldValues((prev) => ({
      ...prev,
      [selected.type]: { ...prev[selected.type], opinion: proposedText },
    }));
    setResolvedAiRound({ accepted: true, proposedText });
    setAiPreviewModal(null);
  };

  const handleAiPreviewReject = () => {
    setResolvedAiRound({ accepted: false });
    setAiPreviewModal(null);
  };

  return (
    <div className={styles.container}>
      {aiPreviewModal != null && selected && (
        <div
          className={styles.modalBackdrop}
          style={{ zIndex: 1001 }}
          role="presentation"
        >
          <div
            className={`${styles.modal} ${styles.modalWide}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-preview-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="ai-preview-title" className={styles.modalHeading}>
              생성된 의사 소견을 진단서에 넣겠습니까?
            </h3>
            <textarea
              className={styles.aiPreviewTextarea}
              readOnly
              value={aiPreviewModal.text}
              rows={12}
              aria-label="AI 생성 소견 미리보기"
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalReject}
                onClick={handleAiPreviewReject}
              >
                거절
              </button>
              <button
                type="button"
                className={styles.modalAccept}
                onClick={handleAiPreviewAccept}
              >
                수락
              </button>
            </div>
          </div>
        </div>
      )}
      {noticeModal != null && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setNoticeModal(null)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-notice-title"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="cert-notice-title" className={styles.modalMessage}>
              {noticeModal}
            </p>
            <button
              type="button"
              className={styles.modalConfirm}
              onClick={() => setNoticeModal(null)}
            >
              확인
            </button>
          </div>
        </div>
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {selected ? selected.label : "진단서"}
        </h2>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.aiButton}
            onClick={handleAiGenerate}
            disabled={
              !selected || saving || aiGenerating || aiPreviewModal != null
            }
          >
            {aiGenerating ? "생성 중…" : "AI 생성"}
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={
              !selected ||
              saving ||
              aiGenerating ||
              aiPreviewModal != null
            }
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
      <div className={styles.body}>
        {selected ? (
          <div className={styles.pdfWrapper} ref={wrapperRef}>
            <embed
              src={`${selected.pdfPath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              type="application/pdf"
              className={styles.pdfEmbed}
            />
            {/* embed 위에 씌워 스크롤/클릭을 차단하는 투명 레이어 */}
            <div className={styles.scrollBlocker} />
            <div className={styles.fieldsLayer} ref={fieldsLayerRef}>
              {FIELD_CONFIGS[selected.type].map((field) =>
                field.multiline ? (
                  <textarea
                    key={field.id}
                    className={styles.overlayTextarea}
                    placeholder={field.label}
                    value={fieldValues[selected.type][field.id] ?? ""}
                    rows={field.rows ?? 3}
                    onChange={(e) => handleChange(selected.type, field.id, e.target.value)}
                    style={{
                      top: field.top,
                      left: field.left,
                      width: field.width,
                    }}
                  />
                ) : (
                  <input
                    key={field.id}
                    type="text"
                    className={styles.overlayInput}
                    placeholder={field.label}
                    value={fieldValues[selected.type][field.id] ?? ""}
                    onChange={(e) => handleChange(selected.type, field.id, e.target.value)}
                    style={{
                      top: field.top,
                      left: field.left,
                      width: field.width,
                    }}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <p className={styles.placeholder}>목록에서 진단서를 선택하세요.</p>
        )}
      </div>
    </div>
  );
}
