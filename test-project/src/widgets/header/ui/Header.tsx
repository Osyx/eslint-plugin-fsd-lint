import React from 'react';

// ✅ VALID: Import from shared via alias
import { Button } from '@shared/ui/Button';

// ✅ VALID: Import from entities via public API
import { User } from '@entities/user';

// ✅ VALID: Relative import within same slice
import { useHeaderLogic } from '../model/hooks';
import type { HeaderProps } from '../model/types';

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { isMenuOpen, toggleMenu } = useHeaderLogic();

  return (
    <header>
      <div>Logo</div>
      <nav>
        {isMenuOpen && <div>Menu</div>}
      </nav>
      <Button onClick={toggleMenu}>Menu</Button>
      {user && <span>Welcome, {user.name}</span>}
    </header>
  );
};