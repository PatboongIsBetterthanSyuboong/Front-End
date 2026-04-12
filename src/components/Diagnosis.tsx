"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMedicalSelection } from "@store/medicalSelection";
import styles from "./Diagnosis.module.css";
import { ClinicVisitContext } from "@/types/clinic";
import { setHistoryDiagnoses } from "@/services/history";
import {
  recommendPrescription,
  type RecommendedPrescriptionItem,
  type PrescriptionRecommendResponse,
} from "@/services/agent";
import { fetchDiagnoseMasterByCode, fetchFirstDiagnoseMasterId } from "@/services/diagnoses";
import { HttpError } from "@/services/http/types";

type DiagnosisProps = {
  clinicVisit: ClinicVisitContext | null;
  ensureHistory: () => Promise<number>;
  employeeId: number;
  onHistoryUpdated?: () => void;
};

function coerceRecommendedItem(raw: Record<string, unknown>): RecommendedPrescriptionItem | null {
  const rank = typeof raw.rank === "number" ? raw.rank : Number(raw.rank);
  const code =
    (typeof raw.prescription_code === "string" && raw.prescription_code) ||
    (typeof raw.prescriptionCode === "string" && raw.prescriptionCode) ||
    "";
  const name =
    (typeof raw.prescription_name === "string" && raw.prescription_name) ||
    (typeof raw.prescriptionName === "string" && raw.prescriptionName) ||
    "";
  const reason = typeof raw.reason === "string" ? raw.reason : "";
  const scoreRaw = raw.confidence_score ?? raw.confidenceScore;
  const confidence_score = typeof scoreRaw === "number" ? scoreRaw : Number(scoreRaw);
  if (!Number.isFinite(rank) || !code) return null;
  return {
    rank,
    prescription_code: code,
    prescription_name: name,
    reason,
    confidence_score: Number.isFinite(confidence_score) ? confidence_score : 0,
  };
}

function normalizeRecommendations(res: PrescriptionRecommendResponse): RecommendedPrescriptionItem[] {
  const raw = res.recommended_prescriptions ?? res.recommendedPrescriptions ?? [];
  const out: RecommendedPrescriptionItem[] = [];
  for (const row of raw) {
    if (row && typeof row === "object") {
      const item = coerceRecommendedItem(row as unknown as Record<string, unknown>);
      if (item) out.push(item);
    }
    if (out.length >= 3) break;
  }
  return out;
}

export default function Diagnosis({ clinicVisit, ensureHistory, employeeId, onHistoryUpdated }: DiagnosisProps) {
  const { diagnoses, removeDiagnosis, clearDiagnoses, addDiagnosis } = useMedicalSelection();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiChoices, setAiChoices] = useState<RecommendedPrescriptionItem[]>([]);
  const prevPatientIdRef = useRef<number | null>(null);

  useEffect(() => {
    const currentPatientId = clinicVisit?.patientId ?? null;
    if (prevPatientIdRef.current !== currentPatientId) {
      prevPatientIdRef.current = currentPatientId;
      clearDiagnoses();
    }
  }, [clinicVisit?.patientId, clearDiagnoses]);

  const handleSave = useCallback(async () => {
    if (!clinicVisit) {
      alert("환자를 먼저 선택해주세요.");
      return;
    }

    if (diagnoses.length === 0) {
      return;
    }

    setSaving(true);
    try {
      const historyId = await ensureHistory();
      await setHistoryDiagnoses(
        historyId,
        employeeId,
        diagnoses.map((item) => ({
          id: item.id,
        }))
      );
      onHistoryUpdated?.();
      alert("처방 정보가 저장되었습니다.");
    } catch (error) {
      console.error("처방 정보 저장 실패:", error);
      alert("처방 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }, [clinicVisit, diagnoses, employeeId, ensureHistory]);

  const handleAiGenerate = useCallback(async () => {
    if (!clinicVisit) {
      alert("환자를 먼저 선택해주세요.");
      return;
    }

    setAiLoading(true);
    try {
      const dummyMasterId = await fetchFirstDiagnoseMasterId();
      if (dummyMasterId == null) {
        alert("처방 마스터가 없어 AI 요청을 위한 더미 저장을 할 수 없습니다.");
        return;
      }

      const historyId = await ensureHistory();
      const savedRows = await setHistoryDiagnoses(historyId, employeeId, [{ id: dummyMasterId }]);
      const historyDiagnoseId = savedRows[0]?.id;
      if (historyDiagnoseId == null) {
        alert("history_diagnose id를 받지 못했습니다.");
        return;
      }

      const recRes = await recommendPrescription({ history_diagnose_id: historyDiagnoseId });

      const choices = normalizeRecommendations(recRes);
      if (choices.length === 0) {
        alert("추천 처방이 비어 있습니다.");
        return;
      }

      setAiChoices(choices);
      setAiModalOpen(true);
      onHistoryUpdated?.();
    } catch (error) {
      console.error("AI 처방 추천 실패:", error);
      if (error instanceof HttpError) {
        alert(`AI 처방 추천에 실패했습니다. [${error.status}] ${error.message}`);
      } else {
        alert("AI 처방 추천에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setAiLoading(false);
    }
  }, [clinicVisit, employeeId, ensureHistory, onHistoryUpdated]);

  const handleAiPick = useCallback(
    async (item: RecommendedPrescriptionItem) => {
      try {
        const master = await fetchDiagnoseMasterByCode(item.prescription_code);
        if (!master) {
          alert(
            `추천 코드 "${item.prescription_code}"에 해당하는 처방 마스터를 찾을 수 없습니다. DB를 확인해 주세요.`
          );
          return;
        }
        addDiagnosis({
          id: master.id,
          code: master.code,
          name: master.name,
          dose: master.dose,
          time: master.time,
          days: master.days,
        });
        setAiModalOpen(false);
        setAiChoices([]);
      } catch (e) {
        console.error(e);
        alert("처방 정보를 불러오지 못했습니다.");
      }
    },
    [addDiagnosis]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>처방</h3>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButtonAI}
            onClick={handleAiGenerate}
            disabled={aiLoading || saving}
          >
            {aiLoading ? "처리 중…" : "AI 생성"}
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={handleSave}
            disabled={diagnoses.length === 0 || saving}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            className={styles.controlButtonSecondary}
            onClick={clearDiagnoses}
            disabled={diagnoses.length === 0}
          >
            전체 삭제
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.diseaseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>No.</th>
                <th>ID</th>
                <th>코드</th>
                <th>처방명</th>
                <th>투여량</th>
                <th>횟수</th>
                <th>일수</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.length === 0 ? (
                <tr className={styles.tableRow}>
                  <td colSpan={8} className={styles.emptyRow}>
                    선택된 처방이 없습니다. 오른쪽 데이터베이스에서 더블클릭하여 추가하세요.
                  </td>
                </tr>
              ) : (
                diagnoses.map((item, index) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.sequence}>{index + 1}</td>
                    <td className={styles.identifier}>{item.id}</td>
                    <td className={styles.code}>{item.code}</td>
                    <td className={styles.name}>{item.name}</td>
                    <td className={styles.dose}>{item.dose}</td>
                    <td className={styles.time}>{item.time}</td>
                    <td className={styles.days}>{item.days}</td>
                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeDiagnosis(item.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {aiModalOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => {
            setAiModalOpen(false);
            setAiChoices([]);
          }}
        >
          <div
            className={styles.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-prescription-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="ai-prescription-modal-title" className={styles.modalTitle}>
              AI 추천 처방 (3개 중 선택)
            </h4>
            <ul className={styles.modalList}>
              {aiChoices.map((item) => (
                <li key={item.rank} className={styles.modalCard}>
                  <div className={styles.modalCardHead}>
                    <span className={styles.modalRank}>#{item.rank}</span>
                    <span className={styles.modalScore}>
                      신뢰도{" "}
                      {(item.confidence_score <= 1
                        ? item.confidence_score * 100
                        : item.confidence_score
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className={styles.modalCode}>{item.prescription_code}</div>
                  <div className={styles.modalName}>{item.prescription_name}</div>
                  {item.reason ? <p className={styles.modalReason}>{item.reason}</p> : null}
                  <button
                    type="button"
                    className={styles.modalSelectBtn}
                    onClick={() => void handleAiPick(item)}
                  >
                    이 처방 적용
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => {
                setAiModalOpen(false);
                setAiChoices([]);
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}