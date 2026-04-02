"use client";

import styles from "./MedicalCertificate.module.css";
import { CertificateItem } from "./CertificateList";

interface MedicalCertificateProps {
  selected: CertificateItem | null;
}

export default function MedicalCertificate({ selected }: MedicalCertificateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>진단서</h2>
      </div>
      <div className={styles.body}>
        {selected ? (
          <p className={styles.placeholder}>
            {/* TODO: 선택된 진단서 상세 내용 표시 */}
          </p>
        ) : (
          <p className={styles.placeholder}>목록에서 진단서를 선택하세요.</p>
        )}
      </div>
    </div>
  );
}
