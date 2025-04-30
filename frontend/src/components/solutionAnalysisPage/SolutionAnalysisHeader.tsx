// 풀이 분석 페이지 상단 부분
// import React from 'react';
import { Link } from 'react-router-dom';
import expand from '@/assets/icons/expand.svg';

const SolutionAnalysisHeader = () => {
  return (
    <div className="flex items-start justify-between py-[32px]">
        <div className=''>
            <p className="headline-large text-gray-700 mb-[8px]">문제 풀이 분석 결과</p>
            <p className="body-small text-gray-300">AI가 풀이 과정을 분석해 사고 흐름과 이해도를 평가하고, 잘한 점과 보완할 부분을 구체적으로 안내해드립니다.</p>
        </div>
        <div className="flex space-x-6">
            <Link to="#" className="flex items-center justify-center body-medium text-gray-500">
                <img src={expand} alt="이전" />
                <p>이전 문제</p>
            </Link>
            <Link to="#" className="flex items-center justify-center body-medium text-gray-500">
                <img src={expand} alt="이전" className='text-gray-500' />
                <p>다음 문제</p>
            </Link>
            <Link to="#" className="flex items-center justify-center rounded-[10px] bg-primary-500 px-[24px] py-[12px] body-medium text-gray-0">→ 텍스트 입력</Link>
        </div>
    </div>
  );
};

export default SolutionAnalysisHeader;