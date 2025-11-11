"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useMedicalSelection } from "@store/medicalSelection";
import { get } from "@/services";
import styles from "./ViewDataBase.module.css";

type ActiveTab = "disease" | "diagnose";

interface DiseaseItem {
  id: number;
  code: string;
  name: string;
}

interface DiagnoseItem extends DiseaseItem {
  dose: number;
  time: number;
  days: number;
}

type ResultItem = DiseaseItem | DiagnoseItem;

export default function ViewDataBase() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("disease");
  const [diseases, setDiseases] = useState<DiseaseItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnoseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addDisease, addDiagnosis } = useMedicalSelection();

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<DiseaseItem[]>("/api/diseases");
      setDiseases(response);
    } catch (err) {
      console.error("Failed to load diseases", err);
      setError("상병 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiagnoses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<DiagnoseItem[]>("/api/diagnoses");
      setDiagnoses(response);
    } catch (err) {
      console.error("Failed to load diagnoses", err);
      setError("진단 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "disease" && diseases.length === 0) {
      void fetchDiseases();
    } else if (activeTab === "diagnose" && diagnoses.length === 0) {
      void fetchDiagnoses();
    }
  }, [activeTab, diseases.length, diagnoses.length, fetchDiseases, fetchDiagnoses]);

  const itemsToRender = useMemo<ResultItem[]>(() => {
    if (activeTab === "disease") {
      return diseases;
    }
    return diagnoses;
  }, [activeTab, diseases, diagnoses]);

  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const handleItemDoubleClick = useCallback(
    (item: ResultItem) => {
      if (activeTab === "disease") {
        addDisease(item as DiseaseItem);
      } else {
        const diagnoseItem = item as DiagnoseItem;
        addDiagnosis({
          ...diagnoseItem,
          dose: diagnoseItem.dose ?? 0,
          time: diagnoseItem.time ?? 0,
          days: diagnoseItem.days ?? 0,
        });
      }
    },
    [activeTab, addDisease, addDiagnosis]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, item: ResultItem) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleItemDoubleClick(item);
      }
    },
    [handleItemDoubleClick]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>데이터베이스 조회</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="상병명 또는 진단명으로 검색"
            className={styles.searchInput}
            disabled={loading}
          />
          <button className={styles.searchButton} disabled={loading}>
            검색
          </button>
        </div>

        <div className={styles.tabSection}>
          <button
            className={`${styles.tab} ${activeTab === "disease" ? styles.active : ""}`}
            onClick={() => handleTabChange("disease")}
            type="button"
            disabled={loading && activeTab !== "disease"}
          >
            상병
          </button>
          <button
            className={`${styles.tab} ${activeTab === "diagnose" ? styles.active : ""}`}
            onClick={() => handleTabChange("diagnose")}
            type="button"
            disabled={loading && activeTab !== "diagnose"}
          >
            진단
          </button>
        </div>

        <div className={styles.resultSection}>
          {error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : loading && itemsToRender.length === 0 ? (
            <div className={styles.loadingMessage}>불러오는 중...</div>
          ) : itemsToRender.length === 0 ? (
            <div className={styles.emptyMessage}>표시할 데이터가 없습니다.</div>
          ) : (
            <div className={styles.resultList}>
              {itemsToRender.map((item) => (
                <div
                  key={item.id}
                  className={styles.resultItem}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  title="더블클릭하거나 Enter 키로 선택 영역에 추가"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => handleKeyDown(event, item)}
                >
                  <div className={styles.resultCode}>{item.code}</div>
                  <div className={styles.resultName}>{item.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

