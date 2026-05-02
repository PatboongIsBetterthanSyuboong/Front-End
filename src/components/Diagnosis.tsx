"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useMedicalSelection } from "@store/medicalSelection";
import styles from "./Diagnosis.module.css";
import { ClinicVisitContext } from "@/types/clinic";
import {
  recommendPrescriptions,
  setHistoryDiagnoses,
  type RecommendedPrescriptionItem,
} from "@/services/history";

type DiagnosisProps = {
  clinicVisit: ClinicVisitContext | null;
  ensureHistory: () => Promise<number>;
  employeeId: number;
  onHistoryUpdated?: () => void;
};

export default function Diagnosis({ clinicVisit, ensureHistory, employeeId, onHistoryUpdated }: DiagnosisProps) {
  const { diseases, diagnoses, addDiagnosis, removeDiagnosis, clearDiagnoses } = useMedicalSelection();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<RecommendedPrescriptionItem[]>([]);
  const [selectedRecommendationKeys, setSelectedRecommendationKeys] = useState<string[]>([]);
  const prevPatientIdRef = useRef<number | null>(null);

  useEffect(() => {
    const currentPatientId = clinicVisit?.patientId ?? null;
    if (prevPatientIdRef.current !== currentPatientId) {
      prevPatientIdRef.current = currentPatientId;
      clearDiagnoses();
      setAiRecommendations([]);
      setSelectedRecommendationKeys([]);
    }
  }, [clinicVisit?.patientId, clearDiagnoses]);

  useEffect(() => {
    setAiRecommendations([]);
    setSelectedRecommendationKeys([]);
  }, [clinicVisit?.historyId]);

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
      const persistableDiagnoses = diagnoses.filter((item) => item.id > 0);
      if (persistableDiagnoses.length === 0) {
        alert("현재 목록은 DB 미매칭 AI 추천만 있어 저장할 수 없습니다.");
        return;
      }
      await setHistoryDiagnoses(
        historyId,
        employeeId,
        persistableDiagnoses.map((item) => ({
          id: item.id,
        }))
      );
      onHistoryUpdated?.();
      if (persistableDiagnoses.length !== diagnoses.length) {
        alert(
          `처방 정보가 저장되었습니다. (DB 매칭 ${persistableDiagnoses.length}건 저장, ${
            diagnoses.length - persistableDiagnoses.length
          }건은 미매칭으로 제외)`
        );
      } else {
        alert("처방 정보가 저장되었습니다.");
      }
    } catch (error) {
      console.error("처방 정보 저장 실패:", error);
      alert("처방 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }, [clinicVisit, diagnoses, employeeId, ensureHistory]);

  const handleGenerateByAI = useCallback(async () => {
    if (!clinicVisit) {
      alert("환자를 먼저 선택해주세요.");
      return;
    }

    setGenerating(true);
    try {
      const historyId = await ensureHistory();
      const response = await recommendPrescriptions({
        history_id: historyId,
        arango_patient_id: clinicVisit.visitNumber || undefined,
        // true 이면 GraphDB/langchain_graph_qa/patient_ctx.example.json 이 증상·top_rx 등을 덮어씀(데모 전용). 실제 Arango/MySQL 기반 추천은 false.
        use_example_context: false,
        disease_codes: diseases.map((d) => d.code),
      });
      const recommended = response.recommended_prescriptions ?? [];

      if (recommended.length === 0) {
        alert(
          "AI 추천 결과가 없습니다.\n\n" +
            "• prescription_api(Python, 보통 포트 8001) 실행 여부\n" +
            "• 백엔드가 해당 URL로 호출 가능한지(ai.prescription-agent.base-url)\n" +
            "• 백엔드 로그에 Python/Gemini 오류가 없는지\n" +
            "를 확인해 주세요."
        );
        return;
      }

      setAiRecommendations(recommended);
      setSelectedRecommendationKeys(recommended.map((item) => `${item.rank}:${item.prescription_code}:${item.prescription_name}`));
      alert("AI 추천이 생성되었습니다. 아래 추천 목록에서 선택 후 '선택 처방 반영'을 눌러주세요.");
    } catch (error) {
      console.error("AI 처방 생성 실패:", error);
      alert("AI 처방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  }, [clinicVisit, diseases, ensureHistory]);

  const toggleRecommendation = useCallback((key: string) => {
    setSelectedRecommendationKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleApplySelectedRecommendations = useCallback(() => {
    if (aiRecommendations.length === 0) {
      alert("먼저 AI 추천을 생성해주세요.");
      return;
    }
    if (selectedRecommendationKeys.length === 0) {
      alert("반영할 추천 처방을 선택해주세요.");
      return;
    }

    let mappedCount = 0;
    let unmappedCount = 0;
    for (const item of aiRecommendations) {
      const key = `${item.rank}:${item.prescription_code}:${item.prescription_name}`;
      if (!selectedRecommendationKeys.includes(key)) {
        continue;
      }
      const isMapped = Boolean(item.id && item.id > 0);
      const diagnosisId = isMapped ? item.id : -Math.max(1, item.rank ?? unmappedCount + 1);
      addDiagnosis({
        id: diagnosisId,
        code: item.prescription_code ?? "",
        name: item.prescription_name ?? "",
        dose: item.dose ?? 0,
        time: item.time ?? 0,
        days: item.days ?? 0,
        reason: isMapped
          ? item.reason ?? ""
          : `[DB 미매칭] ${item.reason ?? "현재 진료 DB에 동일 처방 코드/명이 없습니다."}`,
      });
      if (isMapped) mappedCount += 1;
      else unmappedCount += 1;
    }

    if (mappedCount === 0) {
      alert("선택한 추천은 화면 반영만 되었고, DB 저장 가능한 항목은 없습니다.");
    } else {
      alert(`선택 반영 완료: DB 매칭 ${mappedCount}건, DB 미매칭 ${unmappedCount}건`);
    }
  }, [addDiagnosis, aiRecommendations, selectedRecommendationKeys]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>처방</h3>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButtonAI}
            onClick={handleGenerateByAI}
            disabled={generating}
          >
            {generating ? "생성 중..." : "AI 생성"}
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
        {aiRecommendations.length > 0 ? (
          <div className={styles.aiPanel}>
            <div className={styles.aiPanelHeader}>
              <strong>AI 추천 처방</strong>
              <button type="button" className={styles.controlButtonAI} onClick={handleApplySelectedRecommendations}>
                선택 처방 반영
              </button>
            </div>
            <div className={styles.aiList}>
              {aiRecommendations.map((item) => {
                const key = `${item.rank}:${item.prescription_code}:${item.prescription_name}`;
                return (
                  <label key={key} className={styles.aiItem}>
                    <input
                      type="checkbox"
                      checked={selectedRecommendationKeys.includes(key)}
                      onChange={() => toggleRecommendation(key)}
                    />
                    <span>
                      [{item.rank}] {item.prescription_name} ({item.prescription_code})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className={styles.tableContainer}>
          <table className={styles.diseaseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>No.</th>
                <th>ID</th>
                <th>코드</th>
                <th>처방명</th>
                {/* 
                <th>투여량</th>
                <th>횟수</th>
                <th>일수</th>
                */}
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
                  <Fragment key={`${item.id}-${index}`}>
                    <tr className={styles.tableRow}>
                      <td className={styles.sequence}>{index + 1}</td>
                      <td className={styles.identifier}>{item.id > 0 ? item.id : "미매칭"}</td>
                      <td className={styles.code}>{item.code}</td>
                      <td className={styles.name}>{item.name}</td>
                      
                      {/*
                      <td className={styles.dose}>{item.dose}</td>
                      <td className={styles.time}>{item.time}</td>
                      <td className={styles.days}>{item.days}</td>
                      */  }
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
                    <tr className={styles.reasonRow}>
                      <td colSpan={8} className={styles.reasonCell}>
                        <strong>AI 추천 사유</strong>
                        <p className={styles.reasonText}>{item.reason ?? "-"}</p>
                      </td>
                    </tr>
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}