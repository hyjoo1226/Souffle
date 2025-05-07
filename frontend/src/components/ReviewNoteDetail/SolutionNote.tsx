// 오답노트 상세 페이지 문제 설명 영역
import { useState, useEffect, useRef } from 'react';
import { ReactComponent as Spring_Note } from "@/assets/icons/spring_note.svg";

const SolutionNote = () => {
    const [selected, setSelected] = useState('풀이/개념 정리');
    const tabs = ['풀이/개념 정리', '이전 풀이 분석'];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            const { offsetX, offsetY } = getCoords(e, canvas);
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        };
      
        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing) return;
            const { offsetX, offsetY } = getCoords(e, canvas);
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        };
    
        const stopDrawing = () => {
            setIsDrawing(false);
        };

        // 이벤트 등록
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        // 정리
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
    
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [isDrawing]);

    const getCoords = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e instanceof MouseEvent) {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        } else {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
        }
        return { offsetX: x, offsetY: y };
    };

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
        <div className="flex w-full border border-gray-200 bg-white mt-4">
            <div className="w-1/2 relative">
                <div className='absolute top-6 left-4'>
                    <p className='headline-small text-gray-700'>풀이 정리</p>
                </div>
                <canvas ref={canvasRef} className='w-full h-full'></canvas>
            </div>
            <div className='flex items-center'>
                <Spring_Note className='h-full' />
            </div>
            <div className="w-1/2 relative">
                <div className='absolute top-6 left-4'>
                    <p className='headline-small text-gray-700'>개념 정리</p>
                </div>
            </div>
        </div>
      </div>
    );
  };
  
  export default SolutionNote;