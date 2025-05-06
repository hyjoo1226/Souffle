// 오답노트 상세 페이지 문제 설명 영역
import { useState } from 'react';

const SolutionNote = () => {
    const [selected, setSelected] = useState('풀이/개념 정리');
    const tabs = ['풀이/개념 정리', '이전 풀이 분석'];

    return (
      <div className="">
        <div className='w-full flex justify-end'>
            {/* 토글 버튼 */}
            <div className="flex overflow-hidden w-fit">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        onClick={() => setSelected(tab)}
                        className={`px-9 py-2.5 body-small
                            ${
                            selected === tab
                                ? 'text-primary-500 border border-primary-500 bg-white z-10'
                                : 'text-gray-200 bg-gray-100 border border-gray-200 z-0'
                            }
                            ${index === 1 ? '-ml-px' : ''}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>
    );
  };
  
  export default SolutionNote;