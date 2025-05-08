// 오답노트 상세 페이지 문제 설명 영역
import { useState, useEffect, useRef } from 'react';
import { ReactComponent as Spring_Note } from "@/assets/icons/Spring_Note.svg";
import { ReactComponent as Eraser } from "@/assets/icons/eraser.svg";
import { ReactComponent as Pencil } from "@/assets/icons/pencil.svg";

const SolutionNote = () => {
    const [selected, setSelected] = useState('풀이/개념 정리');
    const [isErasing, setIsErasing] = useState(false);
    const tabs = ['풀이/개념 정리', '이전 풀이 분석'];
    const ALLOWED_POINTERS = ['pen', 'mouse'];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef(false);

    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);
    const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctxRef.current = ctx;

        setTimeout(() => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }, 0);

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        const startDrawing = (e: PointerEvent) => {
            if (!ALLOWED_POINTERS.includes(e.pointerType)) return;
            const ctx = ctxRef.current;
            if (!ctx) return;

            if (isErasing) {
                isDrawingRef.current = true;
                return;
            }

            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
            isDrawingRef.current = true;
            currentStrokeRef.current = [{ x: e.offsetX, y: e.offsetY }];
        };
        
        const draw = (e: PointerEvent) => {
            if (!isDrawingRef.current || !ALLOWED_POINTERS.includes(e.pointerType)) return;
            const ctx = ctxRef.current;
            if (!ctx) return;

            if (isErasing && isDrawingRef.current) {
                const erased = eraseStroke(e.offsetX, e.offsetY);
                if (erased) {
                    isDrawingRef.current = false;
                }
                return;
            }

            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            currentStrokeRef.current.push({ x: e.offsetX, y: e.offsetY });
        };

        const stopDrawing = (e: PointerEvent) => {
            if (!ALLOWED_POINTERS.includes(e.pointerType)) return;
            if (isDrawingRef.current) {
                isDrawingRef.current = false;
                strokesRef.current.push([...currentStrokeRef.current]);
                currentStrokeRef.current = [];
            }
        };
        
        // 이벤트 등록
        canvas.addEventListener('pointerdown', startDrawing);
        canvas.addEventListener('pointermove', draw);
        canvas.addEventListener('pointerup', stopDrawing);
        canvas.addEventListener('pointercancel', stopDrawing);

        // 정리
        return () => {
            canvas.removeEventListener('pointerdown', startDrawing);
            canvas.removeEventListener('pointermove', draw);
            canvas.removeEventListener('pointerup', stopDrawing);
            canvas.removeEventListener('pointercancel', stopDrawing);
        };
    }, [isErasing]);

    const getDistanceFromSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number): number => {
        const dx = bx - ax;
        const dy = by - ay;
        const lengthSquared = dx * dx + dy * dy;

        if (lengthSquared === 0) return Math.hypot(px - ax, py - ay);

        let t = ((px - ax) * dx + (py - ay) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));

        const closestX = ax + t * dx;
        const closestY = ay + t * dy;

        return Math.hypot(px - closestX, py - closestY);
    };

    const eraseStroke = (x: number, y: number): boolean => {
        const ERASE_THRESHOLD = 5;
        const ctx = ctxRef.current;
        if (!ctx) return false;
    
        const index = strokesRef.current.findIndex(stroke => {
            for (let i = 0; i < stroke.length - 1; i++) {
                const p1 = stroke[i];
                const p2 = stroke[i + 1];
                if (getDistanceFromSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= ERASE_THRESHOLD) {
                    return true;
                }
            }
            return false;
        });
    
        if (index !== -1) {
            strokesRef.current.splice(index, 1);
            redrawAllStrokes();
            return true;
        }
    
        return false;
    };    

    const redrawAllStrokes = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        for (const stroke of strokesRef.current) {
            if (stroke.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            ctx.stroke();
        }
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
                <div className='absolute top-6 left-4 flex gap-3.5'>
                    <p className='headline-small text-gray-700'>풀이 정리</p>
                    <div className='flex gap-3'>
                        <Pencil />
                        <Eraser onClick={() => setIsErasing(prev => !prev)} />
                    </div>
                </div>
                <canvas ref={canvasRef} className='w-full h-full' style={{ touchAction: 'none' }}></canvas>
            </div>
            <div className='flex items-center'>
                <Spring_Note className='h-full' />
            </div>
            <div className="w-1/2 relative">
                <div className='absolute top-6 left-4 flex gap-3.5'>
                    <p className='headline-small text-gray-700'>개념 정리</p>
                    <div className='flex gap-3'>
                        <Pencil />
                        <Eraser />
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  };
  
  export default SolutionNote;
