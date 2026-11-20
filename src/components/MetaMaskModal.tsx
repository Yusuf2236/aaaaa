import React from 'react';
import { AuthModal } from './AuthModal';

interface MetaMaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetaMaskModal: React.FC<MetaMaskModalProps> = ({ isOpen, onClose }) => {
  return <AuthModal isOpen={isOpen} onClose={onClose} />;
};
