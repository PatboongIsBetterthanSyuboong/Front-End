"use client";

import { useState } from "react";
import styles from "./ActionBar.module.css";
import Modal from "./Modal";

export default function ActionBar() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  return (
    <>
      <div className={styles.actionBar}>
        <div className={styles.leftSection}>
          <span className={styles.date}>{today}</span>
        </div>

        <div className={styles.rightSection}>
          <button
            className={`${styles.button} ${styles.searchButton}`}
            onClick={handleSearchClick}
          >
            환자 조회
          </button>
        </div>
      </div>

      <Modal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        title="환자 조회"
      >
        <div>
          <p>환자 조회 기능입니다.</p>
          <p>여기에 환자 검색 폼이나 환자 목록이 표시됩니다.</p>
          <br />
          <ul>
            <li>환자명으로 검색</li>
            <li>생년월일로 검색</li>
            <li>연락처로 검색</li>
            <li>환자 목록 표시</li>
            <li>환자 상세 정보 보기</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
