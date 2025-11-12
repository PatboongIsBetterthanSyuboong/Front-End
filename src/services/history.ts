import { post, put } from "./http/client";

export interface HistoryPayload {
  employeeId: number;
  patientId: number;
  deptId: number;
  symptomDetail?: string | null;
  memo?: string | null;
  entryDate: string;
}

export interface HistoryResponse extends HistoryPayload {
  id: number;
}

export interface HistoryDiseasePayload {
  id?: number;
  historyId?: number;
  code: string;
  name: string;
  degree?: string | null;
}

export interface HistoryDiseaseResponse {
  id: number;
  historyId: number;
  code: string;
  name: string;
  degree: string | null;
}

export interface HistoryDiagnosePayload {
  id: number;
}

export interface HistoryDiagnoseResponse {
  id: number;
  historyId: number;
  code: string;
  name: string;
  dose: number;
  time: number;
  days: number;
}

export async function createHistory(payload: HistoryPayload): Promise<HistoryResponse> {
  return post<HistoryResponse, HistoryPayload>("/api/histories/write_history", payload);
}

export async function setHistoryDiseases(
  historyId: number,
  employeeId: number,
  diseases: HistoryDiseasePayload[]
): Promise<HistoryDiseaseResponse[]> {
  return put<HistoryDiseaseResponse[], HistoryDiseasePayload[]>(
    `/api/histories/${historyId}/set_diseases`,
    diseases,
    {
      params: { employeeId },
    }
  );
}

export async function setHistoryDiagnoses(
  historyId: number,
  employeeId: number,
  diagnoses: HistoryDiagnosePayload[]
): Promise<HistoryDiagnoseResponse[]> {
  return put<HistoryDiagnoseResponse[], HistoryDiagnosePayload[]>(
    `/api/histories/${historyId}/set_diagnoses`,
    diagnoses,
    {
      params: { employeeId },
    }
  );
}

export async function getHistories(
  employeeId: number,
  patientId: number,
  startDate?: string,
  endDate?: string
): Promise<HistoryResponse[]> {
  const params: Record<string, string> = { employeeId: String(employeeId), patientId: String(patientId) };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return get<HistoryResponse[]>(`/api/histories/search_history/${employeeId}`, { params });
}


