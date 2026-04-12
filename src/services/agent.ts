import type { InternalAxiosRequestConfig } from "axios";
import { http, post } from "./http/client";
import { fetchDiagnosesPage } from "./diagnoses";

export interface DocumentGenerateRequest {
  historyId: number;
}

export interface DocumentGenerateResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  /** 백엔드(JSON) camelCase */
  medicalCertificate: string;
  /** 스네이크 케이스 응답 호환 */
  medical_certificate?: string;
}

export async function generateDocumentCertificate(
  body: DocumentGenerateRequest
): Promise<DocumentGenerateResponse> {
  return post<DocumentGenerateResponse, DocumentGenerateRequest>(
    "/api/agent/document/generate",
    body
  );
}

export type DocumentFeedbackType = "APPROVE" | "MODIFY" | "REJECT" | "NONE";

/** multipart/form-data — 필드명은 백엔드 스펙과 동일하게 유지 */
export async function saveDocumentCertificate(formData: FormData): Promise<unknown> {
  const res = await http().post<unknown>(
    "/api/agent/document/save",
    formData,
    {
      // axios 기본 Content-Type: application/json 이 FormData를 깨뜨림 → boundary 없이 JSON 직렬화됨
      transformRequest: [
        (data, rawHeaders) => {
          if (data instanceof FormData) {
            const headers = rawHeaders as InternalAxiosRequestConfig["headers"];
            if (headers && typeof headers.delete === "function") {
              headers.delete("Content-Type");
            } else if (headers && typeof headers === "object") {
              delete (headers as Record<string, unknown>)["Content-Type"];
            }
          }
          return data;
        },
      ],
    }
  );
  return res.data;
}

/** POST /api/agent/prescription/recommend 요청(JSON 스네이크 케이스) */
export interface PrescriptionRecommendRequestBody {
  history_diagnose_id: number;
}

export interface RecommendedPrescriptionItem {
  rank: number;
  prescription_code: string;
  prescription_name: string;
  reason: string;
  confidence_score: number;
}

/** 백엔드 직렬화(camelCase / snake_case) 모두 허용 */
export type PrescriptionRecommendResponse = {
  grantType?: string;
  accessToken?: string;
  refreshToken?: string;
  history_diagnose_id?: number;
  /** 오타 대비 */
  history_dignose_id?: number;
  recommended_prescriptions?: RecommendedPrescriptionItem[];
  recommendedPrescriptions?: RecommendedPrescriptionItem[];
};

/**
 * 백엔드 추천 API 미구현 시 UI 검증용 — 실제 응답을 받은 뒤 추천 목록만 더미로 교체.
 * DB에 diagnose 가 있으면 상위 3건 코드를 써서 「적용」 시 마스터 조회가 되도록 함.
 */
async function buildLocalDummyRecommendedPrescriptions(): Promise<RecommendedPrescriptionItem[]> {
  try {
    const page = await fetchDiagnosesPage(0, 3);
    const rows = page.items.slice(0, 3);
    if (rows.length > 0) {
      return rows.map((d, i) => ({
        rank: i + 1,
        prescription_code: d.code,
        prescription_name: d.name,
        reason: "로컬 더미 추천 (백엔드 /api/agent/prescription/recommend 미연동)",
        confidence_score: Math.max(0.55, 0.92 - i * 0.08),
      }));
    }
  } catch {
    // ignore — 아래 고정 더미로 폴백
  }

  return [
    {
      rank: 1,
      prescription_code: "DUMMY-A",
      prescription_name: "더미 처방 A",
      reason: "DB 처방 마스터 없음 — 코드가 DB와 맞지 않으면 적용 시 조회 실패",
      confidence_score: 0.88,
    },
    {
      rank: 2,
      prescription_code: "DUMMY-B",
      prescription_name: "더미 처방 B",
      reason: "로컬 더미 (백엔드 미연동)",
      confidence_score: 0.72,
    },
    {
      rank: 3,
      prescription_code: "DUMMY-C",
      prescription_name: "더미 처방 C",
      reason: "로컬 더미 (백엔드 미연동)",
      confidence_score: 0.61,
    },
  ];
}

export async function recommendPrescription(
  body: PrescriptionRecommendRequestBody
): Promise<PrescriptionRecommendResponse> {
  let remote: PrescriptionRecommendResponse = {};
  try {
    remote = await post<PrescriptionRecommendResponse, PrescriptionRecommendRequestBody>(
      "/api/agent/prescription/recommend",
      body
    );
  } catch {
    // 네트워크/404/스펙 불일치 등 — 토큰·기타 필드 없이 더미 추천만 사용
  }

  const dummyList = await buildLocalDummyRecommendedPrescriptions();

  return {
    ...remote,
    history_diagnose_id: body.history_diagnose_id,
    recommended_prescriptions: dummyList,
    recommendedPrescriptions: undefined,
  };
}
