"use client";

import { useState } from "react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState("환자접수");

  const menuItems = [
    { id: "환자접수", label: "환자 접수"},
    { id: "진료실", label: "진료실"}
  ];

  return (
    <aside className={styles.sidebar}>
      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`${styles.menuItem} ${activeMenu === item.id ? styles.active : ""}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}