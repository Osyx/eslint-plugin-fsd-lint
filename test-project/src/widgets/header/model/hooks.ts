import { useState } from 'react';

export const useHeaderLogic = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  
  return {
    isMenuOpen,
    toggleMenu,
  };
};