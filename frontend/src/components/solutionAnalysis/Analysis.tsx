// GPT 분석
import { useState } from 'react';
import { ReactComponent as Expand } from '@/assets/icons/Expand.svg';
import { ReactComponent as Close } from '@/assets/icons/Close.svg';

type Explanation = {
    explanation_answer: string;
    explanation_description: string;
    explanation_image_url: string;
};

type Props = {
    aiAnalysis: string;
    weakness: string;
    explanation: Explanation;
  };

const Analysis = ({ aiAnalysis, weakness, explanation }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col justify-between px-[20px] pt-[20px] h-[419px]">
            <div className="max-h-[356px] overflow-y-auto scrollbar-none">
                <div className="text-gray-700 mb-10">
                    <p className="headline-small mb-[20px]">문제 풀이 분석</p>
                    {aiAnalysis ? (
                        <p className="body-medium">{aiAnalysis}</p>
                    ) : (
                        <p className="body-medium">문제 풀이 분석이 없습니다.</p>
                    )}
                </div>
                <div className="text-gray-700">
                    <p className="headline-small mb-[20px]">취약점 분석</p>
                    {weakness ? (
                        <p className="body-medium">{weakness}</p>
                    ) : (
                        <p className="body-medium">취약점 분석이 없습니다.</p>
                    )}
                </div>
            </div>
            <div className="w-full pt-[21px] place-items-end">
                <button onClick={() => setIsModalOpen(true)} className="flex text-gray-700">
                    <p className="headline-small">해설 보기</p>
                    <Expand className='transform -scale-x-100' />
                </button>
            </div>

            {/* 해설 모달 */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/20"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="w-[90%] max-w-3xl h-[70vh] bg-white p-6 rounded-[16px] shadow-lg overflow-y-auto scrollbar-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between mb-4">
                            <p className="text-gray-700 headline-large">문제 해설</p>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-700">
                                <Close />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4">
                            {/* 이미지 영역 */}
                            <div className="overflow-y-auto max-h-[60vh] flex justify-center items-start scrollbar-none">
                                {explanation.explanation_image_url ? (
                                    <img src={explanation.explanation_image_url} alt="문제 해설" />
                                ) : (
                                    <p className="body-medium text-gray-500">해설 이미지가 없습니다.</p>
                                )}
                            </div>

                            {/* 해설 텍스트 영역 */}
                            <div className="overflow-y-auto max-h-[60vh] text-sm text-gray-700 whitespace-pre-line leading-relaxed break-words pr-2 scrollbar-none">
                                {explanation.explanation_description || "해설 설명이 없습니다."}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };
  
  export default Analysis;