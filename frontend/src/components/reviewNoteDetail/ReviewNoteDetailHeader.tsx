// 오답노트 상세 페이지 상단 부분
import { Link } from "react-router-dom";

import { ReactComponent as ExpandSlim } from '@/assets/icons/ExpandSlim.svg';
// import { ReactComponent as Export_light } from '@/assets/icons/Export_light.svg';

interface HeaderProps {
  totalSoloveTime?: number;
}

const ReviewNoteDetailHeader = ({ totalSoloveTime }: HeaderProps) => {
  const minute = totalSoloveTime ? Math.floor(totalSoloveTime / 60) : 0;
  const sec = totalSoloveTime ? totalSoloveTime % 60 : 0;

  return (
    <div className="flex justify-between py-[clamp(16px,2.33vh,28px)]">
        <div className='flex items-center justify-center'>
            <ExpandSlim className='text-gray-500' />
            <Link to="/review-list" className="caption-medium text-gray-500">오답노트 리스트</Link>
        </div>
        <div className='flex items-center justify-center'>
            <p className='caption-medium text-gray-500'>
              풀이 시간 {totalSoloveTime ? `${minute}:${sec.toString().padStart(2, '0')}` : '시간 정보 없음'}
            </p>
        </div>
        {/* <div className="flex items-center justify-center">
            <Export_light className='text-gray-500' />
            <p className='caption-medium text-gray-500'>PDF 저장</p>
        </div> */}
    </div>
  );
};

export default ReviewNoteDetailHeader;