import { useState, useRef } from 'react';
import { ReactComponent as Spring_Note } from "@/assets/icons/Spring_Note.svg";
import CanvasArea from "@/components/reviewNoteDetail/CanvasArea";
import { Stroke, SubmissionStep } from "@/types/ReviewNoteDetail";

interface NoteProps {
    weekness?: string;
    aiAnalysis?: string;
    submissionSteps?: SubmissionStep[];
    conceptStrokes?: Stroke[][];
    solutionStrokes?: Stroke[][];
    onStrokeUpdate?: (solution: Stroke[][], concept: Stroke[][]) => void;
}

const SolutionNote = ({ weekness, aiAnalysis, submissionSteps, conceptStrokes, solutionStrokes, onStrokeUpdate  } : NoteProps) => {
  const [selected, setSelected] = useState('풀이/개념 정리');
  const tabs = ['풀이/개념 정리', '이전 풀이 분석'];

  const conceptRef = useRef<Stroke[][]>(conceptStrokes ?? []);
  const solutionRef = useRef<Stroke[][]>(solutionStrokes ?? []);

  const handleSolutionChange = (strokes: Stroke[][]) => {
    solutionRef.current = strokes;
    onStrokeUpdate?.(strokes, conceptRef.current);
  };

  const handleConceptChange = (strokes: Stroke[][]) => {
    conceptRef.current = strokes;
    onStrokeUpdate?.(solutionRef.current, strokes);
  };


  
  return (
    <div className="">
        <div className="w-full flex justify-end">
            <div className="flex overflow-hidden w-fit">
            {tabs.map((tab, i) => (
                <button
                key={tab}
                onClick={() => setSelected(tab)}
                className={`px-9 py-2.5 body-small ${
                    selected === tab
                    ? 'text-primary-500 border border-primary-500 bg-white z-10'
                    : 'text-gray-200 border border-gray-200 bg-gray-100 z-0'
                } ${i===1?'-ml-px':''}`}
                >
                {tab}
                </button>
            ))}
            </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex w-full border border-gray-200 bg-white mt-4 max-h-[579px]">
            {/* 풀이/개념 정리 영역: 보여질 때만 flex, 아니면 hidden */}
            <div className={selected === '풀이/개념 정리' ? 'flex w-full' : 'hidden'}>
                <CanvasArea 
                 title="풀이 정리" 
                 initialStrokes={solutionStrokes}
                 onStrokesChange={handleSolutionChange}
                />
                <div className="flex items-center">
                    <Spring_Note className="h-full" />
                </div>
                <CanvasArea 
                 title="개념 정리" 
                 initialStrokes={conceptStrokes}
                 onStrokesChange={handleConceptChange}
                />
            </div>

            {/* 이전 풀이 분석 영역: 마찬가지로 hidden 토글 */}
            <div className={selected === '이전 풀이 분석' ? 'flex w-full' : 'hidden'}>
                <div className="w-1/2 h-full overflow-auto space-y-4 p-4">
                    {/* step별 풀이 분석 */}
                    {submissionSteps && submissionSteps.length > 0 ? (
                        submissionSteps.map((step) => (
                            <div
                                key={step.step_number}
                                className="relative border-1 border-gray-500 rounded-[10px] p-4"
                            >
                                <p className="body-medium text-gray-700 mb-2 absolute top-4 right-4">
                                    Step {step.step_number}
                                </p>
                                <img
                                    src={step.step_image_url ?? undefined}
                                    alt={`step ${step.step_number}`}
                                    className="w-full h-auto rounded-[10px]"
                                />
                                <div className='absolute bottom-4 right-4'>
                                    <p className={`caption-medium ${step.step_valid ? 'text-green-600' : 'text-red-500'}`}>
                                        {step.step_valid ? '정상 풀이' : '오류'}
                                    </p>
                                    <p className="caption-medium text-gray-700">
                                        소요 시간: {step.step_time}초
                                    </p>
                                </div>
                                {step.step_feedback && (
                                    <p className="caption-small text-gray-600 mt-1">
                                    피드백: {step.step_feedback}
                                    </p>
                                )}
                            </div>
                        ))
                        ) : (
                        <p className="text-gray-400">풀이 단계 데이터가 없습니다.</p>
                        )}
                </div>
                <div className="flex items-center">
                    <Spring_Note className="h-full" />
                </div>
                <div className="w-1/2 h-full overflow-auto">
                    <div className='p-8'>
                        <p className='headline-small text-gray-700 mb-3'>💡 틀린 이유 분석</p>
                        <p className={`body-medium ${aiAnalysis?'text-gray-700':'text-gray-500'} mb-8`}>{aiAnalysis? aiAnalysis : '분석 결과가 없습니다.'}</p>
                        <p className='headline-small text-gray-700 mb-3'>📋 취약점 분석</p>
                        <p className={`body-medium ${weekness?'text-gray-700':'text-gray-500'} mb-8`}>{weekness? weekness : '취약점 분석 결과가 없습니다.'}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SolutionNote;
