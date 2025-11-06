"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ActionBar from "@/components/ActionBar";
import PatientForm from "@/components/PatientForm";
import WaitingStatus from "@/components/WaitingStatus";
import MedicalInfo from "@/components/MedicalInfo";
import SpecialNote from "@/components/SpecialNote";
import HistoryDiagnose from "@/components/HistoryDiagnose";
import Diagnosis from "@/components/Diagnosis";
import Disease from "@/components/Disease";
import ViewDataBase from "@/components/ViewDataBase";
import AIReport from "@/components/AIReport";
import Calender from "@/components/Calender";
import styles from "./page.module.css";

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("환자접수");

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const renderContent = () => {
    if (activeMenu === "환자접수") {
      return (
        <div className={styles.contentGrid}>
          {/* Left Column - Special Notes & History */}
          <div className={styles.leftColumn}>
            <SpecialNote />
            <HistoryDiagnose />
          </div>

          {/* Middle Column - Patient Form */}
          <div className={styles.middleColumn}>
            <PatientForm />
          </div>

          {/* Right Column - Waiting Status & Medical Info */}
          <div className={styles.rightColumn}>
            <WaitingStatus />
            <MedicalInfo />
          </div>
        </div>
      );
    } else if (activeMenu === "진료실") {
      return (
        <div className={styles.contentGridClinic}>
          {/* Left Column - Calendar & History */}
          <div className={styles.leftColumn}>
            <Calender />
            <HistoryDiagnose />
          </div>

          {/* Middle Column - Vertical Layout for Clinic Components */}
          <div className={styles.clinicMiddleColumn}>
            <div className={styles.verticalComponent}>
              <WaitingStatus />
            </div>
              <Disease />
              <Diagnosis />
          </div>

          {/* Right Column - ViewDataBase & AIReport */}
          <div className={styles.clinicRightColumn}>
            <ViewDataBase />
            <AIReport />
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainWrapper}>
        <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />

        <main className={styles.mainContent}>
          <ActionBar />

          <div className={styles.contentArea}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
