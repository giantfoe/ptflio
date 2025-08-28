import { useEffect, FC, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { LiquidGlassButton } from './liquid-glass-button';
import { LiquidGlassEffects } from './liquid-glass-effects';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative backdrop-blur-md bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <LiquidGlassEffects className="absolute inset-0">
          <></>
        </LiquidGlassEffects>
        <div className="relative z-10">
          <LiquidGlassButton
            onClick={onClose}
            variant="ghost"
            size="icon"
            animation="morph"
            glow="subtle"
            ripple={true}
            className="absolute top-4 right-4 w-8 h-8 rounded-full"
          >
            ×
          </LiquidGlassButton>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;