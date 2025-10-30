"use client";

import styles from "./SpecialNote.module.css";

export default function SpecialNote() {
  const specialNotes = [
    "특이사항 없읍니다!"
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>특이사항</h3>
      
      <div className={styles.notesList}>
        {specialNotes.map((note, index) => (
          <div key={index} className={styles.noteItem}>
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}