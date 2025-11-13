"use client";

import { useState, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ActionBar from "@/components/ActionBar";
import PatientInfoBar, { PatientInfo } from "@/components/PatientInfoBar";
import PatientForm from "@/components/PatientForm";
import WaitingStatus, { WaitingVisitContext } from "@/components/WaitingStatus";
import MedicalInfo from "@/components/MedicalInfo";
import SpecialNote from "@/components/SpecialNote";
import History from "@/components/History";
import Diagnosis from "@/components/Diagnosis";
import Disease from "@/components/Disease";
import ViewDataBase from "@/components/ViewDataBase";
import AIReport from "@/components/AIReport";
import Calender from "@/components/Calender";
import TimeLine from "@/components/TimeLine";
import { MedicalSelectionProvider } from "@store/medicalSelection";
import { ClinicVisitContext } from "@/types/clinic";
import styles from "./page.module.css";
import { createHistory } from "@/services/history";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("환자접수");
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [clinicVisit, setClinicVisit] = useState<ClinicVisitContext | null>(null);
  const historyCreationRef = useRef<Promise<number> | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const employeeId = Number(process.env.NEXT_PUBLIC_EMPLOYEE_ID ?? "1") || 1;
  const defaultDeptId = Number(process.env.NEXT_PUBLIC_DEFAULT_DEPT_ID ?? "1") || 1;
  const selectedPatientId = (() => {
    if (!selectedPatient?.patientId) return undefined;
    const parsed = Number(selectedPatient.patientId);
    return Number.isNaN(parsed) ? undefined : parsed;
  })();
  const clinicPatientId = clinicVisit?.patientId ?? selectedPatientId;

  const ensureHistory = useCallback(async () => {
    if (!clinicVisit) {
      throw new Error("선택된 환자 정보가 없습니다.");
    }

    if (clinicVisit.historyId) {
      return clinicVisit.historyId;
    }

    if (historyCreationRef.current) {
      return historyCreationRef.current;
    }

    const entryDate = clinicVisit.entryDate
      ? clinicVisit.entryDate.slice(0, 10)
      : formatLocalDate(new Date());

    const payload = {
      employeeId,
      patientId: clinicVisit.patientId,
      deptId: clinicVisit.deptId || defaultDeptId,
      symptomDetail: clinicVisit.symptom ?? "",
      memo: "",
      entryDate,
    };

    console.log("히스토리 생성 요청", payload);

    const creationPromise = createHistory(payload)
      .then((history) => {
        console.log("히스토리 생성 성공", history);
        setClinicVisit((prev) => {
          if (!prev || prev.patientId !== history.patientId) {
            return prev;
          }
          return { ...prev, historyId: history.id };
        });
        setHistoryRefreshKey((prev) => prev + 1);
        historyCreationRef.current = null;
        return history.id;
      })
      .catch((error) => {
        console.error("히스토리 생성 실패", error);
        historyCreationRef.current = null;
        throw error;
      });

    historyCreationRef.current = creationPromise;
    return creationPromise;
  }, [clinicVisit, defaultDeptId, employeeId]);

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const handlePatientSelection = useCallback(
    (patient: PatientInfo | null, visit?: WaitingVisitContext) => {
      setSelectedPatient(patient);

      if (!patient?.patientId) {
        setClinicVisit(null);
        historyCreationRef.current = null;
        return;
      }

      const patientIdNumber = Number(patient.patientId);
      if (Number.isNaN(patientIdNumber)) {
        setClinicVisit(null);
        historyCreationRef.current = null;
        return;
      }

      setClinicVisit({
        patientId: patientIdNumber,
        deptId: visit?.deptId ?? defaultDeptId,
        waitingId: visit?.waitingId,
        entryDate: visit?.entryDate,
        symptom: visit?.symptom ?? "",
        historyId: null,
      });
      historyCreationRef.current = null;
    },
    [defaultDeptId]
  );

  const renderContent = () => {
    if (activeMenu === "환자접수") {
      return (
        <div className={styles.contentGrid}>
          {/* Left Column - Special Notes & History */}
          <div className={styles.leftColumn}>
            <SpecialNote />
            <History
              employeeId={employeeId}
              patientId={selectedPatientId}
              refreshKey={historyRefreshKey}
            />
          </div>

          {/* Middle Column - Patient Form */}
          <div className={styles.middleColumn}>
            <PatientForm />
          </div>

          {/* Right Column - Waiting Status & Medical Info */}
          <div className={styles.rightColumn}>
            <WaitingStatus
              onPatientSelect={(patient, visit) => handlePatientSelection(patient, visit)}
            />
            <MedicalInfo />
          </div>
        </div>
      );
    } else if (activeMenu === "진료실") {
      return (
        <MedicalSelectionProvider>
          <div className={styles.contentGridClinic}>
            {/* Left Column - Calendar & History */}
            <div className={styles.leftColumn}>
              <Calender employeeId={employeeId} patientId={clinicPatientId} refreshKey={historyRefreshKey} />
              <TimeLine employeeId={employeeId} patientId={clinicPatientId} refreshKey={historyRefreshKey} />
            </div>

            {/* Middle Column - Vertical Layout for Clinic Components */}
            <div className={styles.clinicMiddleColumn}>
              <div className={styles.verticalComponent}>
                <WaitingStatus
                  onPatientSelect={(patient, visit) => handlePatientSelection(patient, visit)}
                />
              </div>
              <Disease
                clinicVisit={clinicVisit}
                ensureHistory={ensureHistory}
                employeeId={employeeId}
                onHistoryUpdated={() => setHistoryRefreshKey((prev) => prev + 1)}
              />
              <Diagnosis
                clinicVisit={clinicVisit}
                ensureHistory={ensureHistory}
                employeeId={employeeId}
                onHistoryUpdated={() => setHistoryRefreshKey((prev) => prev + 1)}
              />
            </div>

            {/* Right Column - ViewDataBase & AIReport */}
            <div className={styles.clinicRightColumn}>
              <ViewDataBase />
              <AIReport />
            </div>
          </div>
        </MedicalSelectionProvider>
      );
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainWrapper}>
        <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />

        <main className={styles.mainContent}>
          <ActionBar onPatientSelect={(patient) => handlePatientSelection(patient, undefined)} />
          <PatientInfoBar patient={selectedPatient ?? undefined} />

          <div className={styles.contentArea}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
