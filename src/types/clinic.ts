export interface ClinicVisitContext {
  patientId: number;
  deptId: number;
  waitingId?: number;
  entryDate?: string;
  symptom?: string | null;
  historyId?: number | null;
}



