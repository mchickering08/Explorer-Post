
import { SignOff, SignOffRole, Message, User } from '../types';

const STORAGE_KEY = 'explorer_riding_hub_signoffs';
const MESSAGES_KEY = 'explorer_riding_hub_messages';
const USERS_KEY = 'explorer_riding_hub_users';

export const getSignoffs = (): SignOff[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSignoff = (
  explorer: string,
  section: string,
  skill: string,
  role: SignOffRole,
  advisor: string,
  signature?: string
): void => {
  const signoffs = getSignoffs();
  const date = new Date().toISOString().split('T')[0];
  
  const index = signoffs.findIndex(s => 
    s.explorer === explorer && 
    s.skill === skill && 
    s.role === role
  );

  if (index > -1) {
    signoffs[index] = { ...signoffs[index], advisor, date, signature };
  } else {
    signoffs.push({
      id: Math.random().toString(36).substr(2, 9),
      explorer,
      section,
      skill,
      role,
      advisor,
      date,
      signature
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(signoffs));
};

export const deleteSignoff = (id: string): void => {
  const signoffs = getSignoffs();
  const filtered = signoffs.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getExplorerProgress = (explorer: string) => {
  const allSignoffs = getSignoffs().filter(s => s.explorer === explorer);
  return allSignoffs;
};

export const getAdvisorActivity = (advisor: string) => {
  // Try matching by display name or username initial-last pattern
  return getSignoffs().filter(s => 
    s.advisor.toLowerCase() === advisor.toLowerCase()
  );
};

export const getAllAdvisors = () => {
  const signoffs = getSignoffs();
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

// Message Logic
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

// User Profile Logic
export const updateUserProfile = (userId: string, updates: Partial<User>): void => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return;
  const users: (User & { password?: string })[] = JSON.parse(data);
  const index = users.findIndex(u => u.id === userId);
  if (index > -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also update current session if it's the same user
    const sessionData = localStorage.getItem('explorer_riding_hub_session');
    if (sessionData) {
      const sessionUser: User = JSON.parse(sessionData);
      if (sessionUser.id === userId) {
        localStorage.setItem('explorer_riding_hub_session', JSON.stringify({ ...sessionUser, ...updates }));
      }
    }
  }
};
