
import { SignOff, SignOffRole, Message, User, ShiftLog, SignOffStatus } from '../types';

const STORAGE_KEY = 'explorer_riding_hub_signoffs';
const MESSAGES_KEY = 'explorer_riding_hub_messages';
const USERS_KEY = 'explorer_riding_hub_users';
const HOURS_KEY = 'explorer_riding_hub_hours';

export const getSignoffs = (): SignOff[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const requestSignoff = (
  explorer: string,
  section: string,
  skill: string,
  role: SignOffRole,
  advisor: string
): void => {
  const signoffs = getSignoffs();
  const date = new Date().toISOString().split('T')[0];
  
  // Create a pending request
  signoffs.push({
    id: Math.random().toString(36).substr(2, 9),
    explorer,
    section,
    skill,
    role,
    advisor,
    date,
    status: SignOffStatus.REQUESTED
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(signoffs));
};

export const signRequest = (requestId: string, signature: string): void => {
  const signoffs = getSignoffs();
  const index = signoffs.findIndex(s => s.id === requestId);
  if (index > -1) {
    signoffs[index].signature = signature;
    signoffs[index].status = SignOffStatus.SIGNED;
    signoffs[index].date = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signoffs));
  }
};

export const deleteSignoff = (id: string): void => {
  const signoffs = getSignoffs();
  const filtered = signoffs.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getExplorerProgress = (explorer: string) => {
  return getSignoffs().filter(s => s.explorer === explorer && s.status === SignOffStatus.SIGNED);
};

export const getPendingRequests = (advisorName: string) => {
  return getSignoffs().filter(s => 
    s.advisor.toLowerCase() === advisorName.toLowerCase() && 
    s.status === SignOffStatus.REQUESTED
  );
};

export const getAdvisorActivity = (advisor: string) => {
  return getSignoffs().filter(s => 
    s.advisor.toLowerCase() === advisor.toLowerCase() &&
    s.status === SignOffStatus.SIGNED
  );
};

export const getAllAdvisors = () => {
  const signoffs = getSignoffs().filter(s => s.status === SignOffStatus.SIGNED);
  const advisorMap = new Map<string, { count: number; lastDate: string }>();
  
  signoffs.forEach(s => {
    const existing = advisorMap.get(s.advisor) || { count: 0, lastDate: s.date };
    advisorMap.set(s.advisor, {
      count: existing.count + 1,
      lastDate: s.date > existing.lastDate ? s.date : existing.lastDate
    });
  });

  return Array.from(advisorMap.entries()).map(([name, stats]) => ({
    name,
    ...stats
  }));
};

export const getMessages = (): Message[] => {
  const data = localStorage.getItem(MESSAGES_KEY);
  return data ? JSON.parse(data) : [];
};

export const sendMessage = (from: string, to: string, text: string): void => {
  const messages = getMessages();
  messages.push({
    id: Math.random().toString(36).substr(2, 9),
    from,
    to,
    text,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

export const getShiftLogs = (): ShiftLog[] => {
  const data = localStorage.getItem(HOURS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getMonthlyHours = (explorer: string, year: number, month: number): number => {
  const logs = getShiftLogs().filter(l => {
    const d = new Date(l.date);
    return l.explorer === explorer && d.getFullYear() === year && d.getMonth() === month;
  });
  return logs.reduce((acc, l) => acc + l.totalHours, 0);
};

export const saveShiftLog = (log: Omit<ShiftLog, 'id'>): void => {
  const logs = getShiftLogs();
  logs.push({
    ...log,
    id: Math.random().toString(36).substr(2, 9)
  });
  localStorage.setItem(HOURS_KEY, JSON.stringify(logs));
};

export const deleteShiftLog = (id: string): void => {
  const logs = getShiftLogs();
  const filtered = logs.filter(l => l.id !== id);
  localStorage.setItem(HOURS_KEY, JSON.stringify(filtered));
};

export const updateUserProfile = (userId: string, updates: Partial<User>): void => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return;
  const users: (User & { password?: string })[] = JSON.parse(data);
  const index = users.findIndex(u => u.id === userId);
  if (index > -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const sessionData = localStorage.getItem('explorer_riding_hub_session');
    if (sessionData) {
      const sessionUser: User = JSON.parse(sessionData);
      if (sessionUser.id === userId) {
        localStorage.setItem('explorer_riding_hub_session', JSON.stringify({ ...sessionUser, ...updates }));
      }
    }
  }
};

export const exportAllData = () => {
  const data = {
    signoffs: getSignoffs(),
    messages: getMessages(),
    hours: getShiftLogs(),
    users: JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `explorer_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};
