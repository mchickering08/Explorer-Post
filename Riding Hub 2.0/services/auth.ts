
import { User, UserRole, AppVersion } from '../types';
import { EXPLORERS_LIST as INITIAL_EXPLORERS, ALL_INSTRUCTORS as INITIAL_INSTRUCTORS } from '../constants';

const USERS_KEY = 'explorer_riding_hub_users';
const SESSION_KEY = 'explorer_riding_hub_session';
const PERSIST_KEY = 'explorer_riding_hub_remember';
const SITE_AUTH_KEY = 'explorer_riding_hub_site_pass';
const SITE_PASS_VALUE_KEY = 'explorer_riding_hub_site_password_value';

export const ADMIN_USERNAME = 'mchickering';
export const ADMIN_PASSWORD = 'Test123';
export const DEFAULT_SITE_PASSWORD = 'Explorerpost911!';
export const DEFAULT_USER_PASSWORD = 'Explorer1111';

export const generateUsername = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name.toLowerCase();
  return (parts[0][0] + parts[parts.length - 1]).toLowerCase();
};

export const getSiteVersion = (): AppVersion => {
  return AppVersion.V2;
};

export const getSitePassword = (): string => {
  return localStorage.getItem(SITE_PASS_VALUE_KEY) || DEFAULT_SITE_PASSWORD;
};

export const updateSitePassword = (newPassword: string): void => {
  localStorage.setItem(SITE_PASS_VALUE_KEY, newPassword);
};

export const isSiteAuthenticated = (): boolean => {
  return localStorage.getItem(SITE_AUTH_KEY) === 'true';
};

export const authenticateSite = (password: string): boolean => {
  if (password === getSitePassword()) {
    localStorage.setItem(SITE_AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutSite = (): void => {
  localStorage.removeItem(SITE_AUTH_KEY);
};

export const getUsers = (): (User & { password?: string })[] => {
  const data = localStorage.getItem(USERS_KEY);
  let users: (User & { password?: string })[] = data ? JSON.parse(data) : [];

  const updateRequired = users.length === 0;

  if (updateRequired) {
    INITIAL_EXPLORERS.forEach(name => {
      const uname = generateUsername(name);
      if (!users.find(u => u.displayName === name)) {
        users.push({
          id: Math.random().toString(36).substr(2, 9),
          username: uname,
          displayName: name,
          role: UserRole.EXPLORER,
          password: DEFAULT_USER_PASSWORD
        });
      }
    });

    INITIAL_INSTRUCTORS.forEach(name => {
      const uname = generateUsername(name);
      if (!users.find(u => u.displayName === name)) {
        users.push({
          id: Math.random().toString(36).substr(2, 9),
          username: uname,
          displayName: name,
          role: UserRole.ADVISOR,
          password: DEFAULT_USER_PASSWORD
        });
      }
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  return users;
};

export const changePassword = (userId: string, newPassword: string): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index > -1) {
    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }
  return false;
};

export const addUser = (name: string, role: UserRole): boolean => {
  const users = getUsers();
  const uname = generateUsername(name);
  if (users.find(u => u.username === uname)) return false;

  users.push({
    id: Math.random().toString(36).substr(2, 9),
    username: uname,
    displayName: name,
    role: role,
    password: DEFAULT_USER_PASSWORD
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const registerUser = (data: { username: string; password?: string; role: UserRole; displayName: string }): User | null => {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.displayName.toLowerCase() === data.displayName.toLowerCase());
  
  if (existingUserIndex > -1) {
    // If user already exists (pre-populated instructor), just update password and log them in
    users[existingUserIndex].password = data.password || DEFAULT_USER_PASSWORD;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = users[existingUserIndex];
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword as User;
  }

  // Otherwise create new
  const uname = generateUsername(data.displayName);
  const newUser: User & { password?: string } = {
    id: Math.random().toString(36).substr(2, 9),
    username: uname,
    displayName: data.displayName,
    role: data.role,
    password: data.password || DEFAULT_USER_PASSWORD
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  
  return userWithoutPassword as User;
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginUser = (username: string, password?: string, rememberMe: boolean = false): User | null => {
  let authenticatedUser: User | null = null;
  const unameNormalized = username.trim().toLowerCase();

  if (unameNormalized === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    authenticatedUser = {
      id: 'admin-root',
      username: ADMIN_USERNAME,
      displayName: 'Admin User',
      role: UserRole.ADMIN
    };
  } else {
    const users = getUsers();
    const user = users.find(u => u.username === unameNormalized && u.password === password);
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
