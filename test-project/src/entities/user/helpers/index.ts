// Custom segment example - helpers
import type { User } from '../model/types';

export const formatUserName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

export const getUserInitials = (user: User): string => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

export const isUserActive = (user: User): boolean => {
  return user.status === 'active';
};