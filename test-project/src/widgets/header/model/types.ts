import type { User } from '@entities/user';

export interface HeaderProps {
  user?: User;
  onLogout?: () => void;
}