"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/services/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup({ name, email, password });
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "회원가입에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "64px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>회원가입</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>이름</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          />
        </label>

        {error && (
          <div style={{ color: "#c00", fontSize: 14 }} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#111",
            color: "#fff",
            border: 0,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 14 }}>
        이미 계정이 있으신가요? <Link href="/login">로그인</Link>
      </p>
    </div>
  );
}


