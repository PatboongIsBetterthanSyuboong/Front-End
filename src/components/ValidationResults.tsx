"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getValidationResults,
  runValidationAgent,
  type ValidationResultItem,
} from "@/services/history";
import styles from "./ValidationResults.module.css";

interface ValidationResultsProps {
  historyId?: number | null;
  employeeId: number;
  refreshKey?: number;
}

function statusClass(status: string): string {
  switch (status) {
    case "PASS":
      return styles.pass;
    case "WARNING":
      return styles.warning;
    case "CRITICAL":
      return styles.critical;
    case "NEEDS_REVIEW":
      return styles.needsReview;
    default:
      return "";
  }
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ValidationResults({
  historyId,
  employeeId,
  refreshKey = 0,
}: ValidationResultsProps) {
  const [results, setResults] = useState<ValidationResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    if (!historyId) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getValidationResults(historyId, employeeId);
      setResults(response);
    } catch (err) {
      console.error("검증 결과 조회 실패:", err);
      setError("검증 결과를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, historyId]);

  useEffect(() => {
    void loadResults();
  }, [loadResults, refreshKey]);

  const handleRunValidation = async () => {
    if (!historyId) return;
    setRunning(true);
    setError(null);
    try {
      const response = await runValidationAgent(historyId, employeeId);
      setResults(response);
    } catch (err) {
      console.error("검증 에이전트 실행 실패:", err);
      setError("검증 에이전트 실행에 실패했습니다.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>검증 에이전트</h3>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.runButton}
            onClick={() => void handleRunValidation()}
            disabled={!historyId || loading || running}
          >
            {running ? "검증 중..." : "검증 실행"}
          </button>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => void loadResults()}
            disabled={!historyId || loading || running}
          >
            {loading ? "조회 중..." : "새로고침"}
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {!historyId ? (
          <p className={styles.hint}>환자를 선택하면 검증 에이전트를 실행할 수 있습니다.</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : results.length === 0 ? (
          <p className={styles.empty}>
            아직 검증 결과가 없습니다. 검증 실행 버튼을 눌러 현재 상병/처방/X-ray 결과를 확인하세요.
          </p>
        ) : (
          <div className={styles.list}>
            {results.slice(0, 3).map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={`${styles.badge} ${statusClass(item.overallStatus)}`}>
                    {item.overallStatus}
                  </span>
                  <span className={styles.date}>{formatDate(item.createdAt)}</span>
                </div>
                <p className={styles.summary}>{item.summary}</p>
                <div className={styles.flags}>
                  {item.shouldNotifyDoctor && <span className={styles.flag}>의사 확인 필요</span>}
                  {item.shouldBlockAutoPrescription && <span className={styles.flag}>자동 처방 차단 권고</span>}
                  <span className={styles.flag}>event #{item.eventId}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
