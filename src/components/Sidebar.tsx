"use client";

import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export default function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
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
            onClick={() => onMenuChange(item.id)}
            className={`${styles.menuItem} ${activeMenu === item.id ? styles.active : ""}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}