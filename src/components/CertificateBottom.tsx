"use client";

import { useState } from "react";
import styles from "./CertificateBottom.module.css";

const TABS = ["상병", "상용구", "과거처방", "사용자설정"] as const;
type Tab = typeof TABS[number];

export default function CertificateBottom() {
  const [activeTab, setActiveTab] = useState<Tab>("상병");

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {activeTab === "상병" && (
          <p className={styles.placeholder}>상병 내용을 여기에 추가하세요.</p>
        )}
        {activeTab === "상용구" && (
          <p className={styles.placeholder}>상용구 내용을 여기에 추가하세요.</p>
        )}
        {activeTab === "과거처방" && (
          <p className={styles.placeholder}>과거처방 내용을 여기에 추가하세요.</p>
        )}
        {activeTab === "사용자설정" && (
          <p className={styles.placeholder}>사용자설정 내용을 여기에 추가하세요.</p>
        )}
      </div>
    </div>
  );
}
