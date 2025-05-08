// 오답노트 상세 페이지 상단 부분
import { ReactComponent as ExpandSlim } from '@/assets/icons/ExpandSlim.svg';
import { ReactComponent as Export_light } from '@/assets/icons/Export_light.svg';

const ReviewNoteDetailHeader = () => {
  return (
    <div className="flex justify-between py-[clamp(16px,2.33vh,28px)]">
        <div className='flex items-center justify-center'>
            <ExpandSlim className='text-gray-500' />
            <p className="caption-medium text-gray-500">오답노트 리스트</p>
        </div>
        <div className='flex items-center justify-center'>
            <p className='caption-medium text-gray-500'>19:32</p>
        </div>
        <div className="flex items-center justify-center">
            <Export_light className='text-gray-500' />
            <p className='caption-medium text-gray-500'>PDF 저장</p>
        </div>
    </div>
  );
};

export default ReviewNoteDetailHeader;