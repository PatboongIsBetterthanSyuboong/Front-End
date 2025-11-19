"use client";

import { useState, useEffect } from "react";
import { getAllUsers, setRole } from "@/services/super";
import { User, Role } from "@/types/user";
import styles from "./page.module.css";

export default function SuperPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoles, setUpdatingRoles] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      // 응답이 배열인 경우와 객체인 경우 모두 처리
      const userList = Array.isArray(data) ? data : (data?.users ?? []);
      setUsers(userList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "유저 목록을 불러오는데 실패했습니다";
      setError(message);
      setUsers([]); // 에러 발생 시 빈 배열로 초기화
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: number, newRole: Role) {
    setUpdatingRoles((prev) => new Set(prev).add(userId));
    try {
      await setRole({ id: userId, role: newRole });
      // 성공 시 로컬 상태 업데이트
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "역할 변경에 실패했습니다";
      setError(message);
    } finally {
      setUpdatingRoles((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  function getRoleLabel(role: Role): string {
    const roleMap: Record<Role, string> = {
      [Role.DEFAULT]: "일반",
      [Role.SUPER_USER]: "관리자",
      [Role.DOCTOR]: "의사",
      [Role.NURSE]: "간호사",
      [Role.RECEPTIONIST]: "접수원",
    };
    return roleMap[role] || role;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* 헤더 카드 */}
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.headerTitle}>전체 유저 조회</h1>
              {!loading && users && users.length > 0 && (
                <p className={styles.headerSubtitle}>
                  총 <strong>{users.length}명</strong>의 유저가 등록되어 있습니다
                </p>
              )}
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className={styles.refreshButton}
            >
              {loading ? "로딩 중..." : "새로고침"}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        {/* 컨텐츠 카드 */}
        <div className={styles.contentCard}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <p className={styles.loadingText}>로딩 중...</p>
            </div>
          ) : !users || users.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyTitle}>등록된 유저가 없습니다</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeader}>ID</th>
                    <th className={styles.tableHeader}>이름</th>
                    <th className={styles.tableHeader}>사용자명</th>
                    <th className={styles.tableHeader}>역할</th>
                    <th className={styles.tableHeader}>부서 ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const rowClass =
                      index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd;
                    return (
                      <tr
                        key={user.id}
                        className={`${styles.tableRow} ${rowClass}`}
                      >
                        <td className={`${styles.tableCell} ${styles.tableCellId}`}>
                          #{user.id}
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellName}`}>
                          {user.name}
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellUsername}`}>
                          {user.username}
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellRole}`}>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                            disabled={updatingRoles.has(user.id)}
                            className={styles.roleSelect}
                          >
                            <option value={Role.DEFAULT}>{getRoleLabel(Role.DEFAULT)}</option>
                            <option value={Role.SUPER_USER}>{getRoleLabel(Role.SUPER_USER)}</option>
                            <option value={Role.DOCTOR}>{getRoleLabel(Role.DOCTOR)}</option>
                            <option value={Role.NURSE}>{getRoleLabel(Role.NURSE)}</option>
                            <option value={Role.RECEPTIONIST}>{getRoleLabel(Role.RECEPTIONIST)}</option>
                          </select>
                        </td>
                        <td className={styles.tableCell}>
                          {user.deptId ? (
                            <span className={styles.deptBadge}>{user.deptId}</span>
                          ) : (
                            <span className={styles.deptEmpty}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


