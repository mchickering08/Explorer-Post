
import { User, UserRole } from '../types';

const USERS_KEY = 'explorer_riding_hub_users';
const SESSION_KEY = 'explorer_riding_hub_session';
const PERSIST_KEY = 'explorer_riding_hub_remember';

export const ADMIN_USERNAME = 'mchickering';
export const ADMIN_PASSWORD = 'Test123';

export const getUsers = (): (User & { password?: string })[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const registerUser = (userData: Omit<User, 'id'> & { password?: string }): User | null => {
  const users = getUsers();
  if (userData.username === ADMIN_USERNAME) return null;
  if (users.find(u => u.username === userData.username)) return null;
  
  const newUser: User = {
    ...userData,
    id: Math.random().toString(36).substr(2, 9),
  };
  
  users.push({ ...newUser, password: userData.password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto-login after registration
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = (username: string, password?: string, rememberMe: boolean = false): User | null => {
  let authenticatedUser: User | null = null;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    authenticatedUser = {
      id: 'admin-root',
      username: ADMIN_USERNAME,
      displayName: 'Admin User',
      role: UserRole.ADMIN
    };
  } else {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      authenticatedUser = userWithoutPassword as User;
    }
  }

  if (authenticatedUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
    if (rememberMe) {
      localStorage.setItem(PERSIST_KEY, 'true');
    } else {
      localStorage.removeItem(PERSIST_KEY);
    }
    return authenticatedUser;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PERSIST_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  return JSON.parse(data);
};

export const getAllUsersWithPasswords = () => {
  return getUsers();
};
