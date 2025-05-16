// "해설 보기" 버튼 클릭 시 등장하는 모달
import { ReactComponent as Close } from '@/assets/icons/Close.svg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/30"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-[90%] max-w-[600px] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6"
        >
          <Close />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
