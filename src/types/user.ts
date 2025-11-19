export enum Role {
    DEFAULT = "DEFAULT",
    SUPER_USER = "SUPER_USER",
    DOCTOR = "DOCTOR",
    NURSE = "NURSE",
    RECEPTIONIST = "RECEPTIONIST",
}

export interface User {
  id: number;
  name: string;
  deptId?: string;
  role: Role;
  username: string;
  password?: string;
}