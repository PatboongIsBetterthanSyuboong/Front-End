"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Header.module.css";
import ChatbotPopup from "./ChatbotPopup";

// 챗봇 버튼이 표시될 라우트 목록
const CHATBOT_ENABLED_ROUTES = ["/dashboard"];

// 챗봇 버튼이 표시될 메뉴 목록 (undefined면 메뉴 조건 무시)
const CHATBOT_ENABLED_MENUS = ["진료실"];

interface HeaderProps {
  activeMenu?: string;
}

export default function Header({ activeMenu }: HeaderProps) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);

  const routeEnabled = CHATBOT_ENABLED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const menuEnabled =
    activeMenu === undefined || CHATBOT_ENABLED_MENUS.includes(activeMenu);
  const showChatbot = routeEnabled && menuEnabled;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>슈붕보다팥붕</h1>
        </div>

        <div className={styles.rightSection}>
          {showChatbot && (
            <button
              className={`${styles.button} ${styles.chatbotBtn}`}
              onClick={() => setChatOpen((prev) => !prev)}
              aria-label="AI 챗봇 열기"
            >
              AI 챗봇
            </button>
          )}
          <span className={styles.username}>김동국</span>
          <Link href="/login" className={styles.button}>
            로그아웃
          </Link>
        </div>
      </header>

      {chatOpen && <ChatbotPopup onClose={() => setChatOpen(false)} />}
    </>
  );
}