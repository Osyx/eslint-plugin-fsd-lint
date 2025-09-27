import React from 'react';

// ✅ VALID: Multi-level relative import within same slice
import { formatUserName, getUserInitials } from '../../../helpers';
import { validateEmail } from '../../../validators';
import type { User } from '../../../model/types';

// ✅ VALID: Going up to access API within same slice
import { userService } from '../../../services';

// ✅ VALID: Import from shared
import { Button } from '@shared/ui/Button';

interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const isEmailValid = validateEmail(user.email);
  const initials = getUserInitials(user);
  const fullName = formatUserName(user);

  return (
    <div className="user-card">
      <div className="avatar">{initials}</div>
      <h3>{fullName}</h3>
      <p>{user.email} {isEmailValid && '✓'}</p>
      {onEdit && <Button onClick={onEdit}>Edit</Button>}
    </div>
  );
};