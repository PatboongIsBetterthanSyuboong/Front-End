import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ActionBar from "@/components/ActionBar";
import PatientForm from "@/components/PatientForm";
import PatientStatus from "@/components/PatientStatus";
import MedicalInfo from "@/components/MedicalInfo";
import SpecialNote from "@/components/SpecialNote";
import HistoryDiagnose from "@/components/HistoryDiagnose";
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainWrapper}>
        <Sidebar />

        <main className={styles.mainContent}>
          <ActionBar />

          <div className={styles.contentArea}>
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
              
              {/* Right Column - Patient Status & Medical Info */}
              <div className={styles.rightColumn}>
                <PatientStatus />
                <MedicalInfo />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
