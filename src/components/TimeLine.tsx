"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./TimeLine.module.css";
import { getPatientHistories } from "@/services/history";
import type { HistoryEntry } from "@/types/history";

type TimeLineProps = {
  employeeId: number;
  patientId?: number | null;
  refreshKey?: number;
};

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, "-")
      .replace(/ /g, "")
      .slice(0, -1);
  } catch {
    return dateString;
  }
}

function formatSymptom(symptom?: string | null) {
  if (!symptom || symptom.trim().length === 0) {
    return "증상이 입력되지 않았습니다.";
  }
  return symptom;
}

export default function TimeLine({ employeeId, patientId, refreshKey }: TimeLineProps) {
  const [histories, setHistories] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setHistories([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 5);

    const startDateStr = startDate.toISOString().slice(0, 10);
    const endDateStr = endDate.toISOString().slice(0, 10);

    getPatientHistories(employeeId, patientId, startDateStr, endDateStr)
      .then((res) => {
        const list = Array.isArray(res.histories) ? res.histories : [];
        const sorted = [...list].sort((a, b) => {
          const dateA = new Date(a.entryDate ?? "").getTime();
          const dateB = new Date(b.entryDate ?? "").getTime();
          return dateB - dateA;
        });
        setHistories(sorted);
      })
      .catch((err) => {
        console.error("히스토리 목록 조회 실패:", err);
        setError("히스토리 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [employeeId, patientId, refreshKey]);

  const groupedByYear = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    histories.forEach((history) => {
      const date = history.entryDate ? new Date(history.entryDate) : null;
      const key = date ? String(date.getFullYear()) : "기타";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(history);
    });
    return map;
  }, [histories]);

  const [activeYear] = useMemo(() => {
    const years = [...groupedByYear.keys()];
    if (years.length === 0) {
      return [new Date().getFullYear().toString()];
    }
    return [years[0]];
  }, [groupedByYear]);

  return (
    <section className={styles.container} aria-label="환자 내원 타임라인">
      <div className={styles.header}>
        <h3 className={styles.title}>내원정보 TimeLine</h3>
        <div className={styles.yearNav}>
          <button type="button" className={styles.arrowButton} disabled>
            ◀
          </button>
          <span>{activeYear}</span>
          <button type="button" className={styles.arrowButton} disabled>
            ▶
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {!patientId ? (
          <div className={styles.placeholder}>환자를 선택하면 내원 기록을 확인할 수 있습니다.</div>
        ) : loading ? (
          <div className={styles.loading}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : histories.length === 0 ? (
          <div className={styles.emptyState}>등록된 내원 기록이 없습니다.</div>
        ) : (
          [...groupedByYear.entries()].map(([year, entries]) => (
            <div key={year} className={styles.list} aria-label={`${year}년 내원 기록`}>
              {entries.map((entry) => (
                <article key={entry.id} className={styles.item}>
                  <div className={styles.dateRow}>
                  <span className={styles.date}>{formatDate(entry.entryDate)}</span>
                    <div className={styles.tags}>
                      <span className={styles.tag}>초진</span>
                      <span>보험</span>
                    </div>
                  </div>
                  <div className={styles.detail}>{formatSymptom(entry.symptomDetail)}</div>
                  <div className={styles.meta}>
                    <span>담당의 ID: {entry.employeeId}</span>
                    <span>진료과: {entry.deptId}</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span>진료비 : ₩ 0</span>
                  </div>
                </article>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}


