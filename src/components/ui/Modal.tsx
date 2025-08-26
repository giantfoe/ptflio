import { useEffect, FC, ReactNode } from 'react';
import ReactDOM from 'react-dom';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="bg-neutral-900 rounded-lg p-4 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;