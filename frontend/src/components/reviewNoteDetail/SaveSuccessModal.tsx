import { Dialog } from '@headlessui/react';
import { Button } from '@/components/common/Button';

interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveSuccessModal = ({ isOpen, onClose }: SaveSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <div className="bg-white rounded-2xl shadow-xl p-6 z-10 max-w-sm w-full">
          <Dialog.Title className="text-lg font-semibold text-gray-800 mb-3">저장 완료</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-6">
            입력한 내용이 성공적으로 저장되었습니다.
          </Dialog.Description>
          <div className="flex justify-end">
            <Button variant="solid" onClick={onClose}>확인</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SaveSuccessModal;
