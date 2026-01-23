
export enum SignOffRole {
  TAUGHT_BY = 'Taught By',
  DEMO_1 = 'Demo 1',
  DEMO_2 = 'Demo 2'
}

export enum UserRole {
  EXPLORER = 'Explorer',
  ADVISOR = 'Advisor',
  ADMIN = 'Admin'
}

export enum SignOffStatus {
  REQUESTED = 'Requested',
  SIGNED = 'Signed'
}

export enum AppVersion {
  V1 = 'V1',
  V2 = 'V2',
  V3 = 'V3'
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  profilePhoto?: string; // base64 string
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

export interface SignOff {
  id: string;
  explorer: string;
  skill: string;
  section: string;
  role: SignOffRole;
  advisor: string;
  signature?: string; // base64 drawing
  date: string;
  status: SignOffStatus;
}

export interface ShiftLog {
  id: string;
  explorer: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  totalHours: number;
}

export interface SkillDefinition {
  name: string;
}

export interface SectionDefinition {
  title: string;
  skills: SkillDefinition[];
  isALS?: boolean;
}
