// SolutionNote.tsx에 들어가는 수식 정리 노트 컴포넌트
import { useState, useEffect, useRef } from 'react';
import { ReactComponent as Eraser } from "@/assets/icons/Eraser.svg";
import { ReactComponent as Pencil } from "@/assets/icons/Pencil.svg";

type Mode = 'draw' | 'erase';

interface CanvasAreaProps {
  title: string;
  initialStrokes?: Array<Array<{ x: number; y: number }>>;
}

export default function CanvasArea({ title, initialStrokes }: CanvasAreaProps) {
  const [mode, setMode] = useState<Mode>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);
  const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);

  // stroke 다시 그리기
  const redrawAllStrokes = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    // 캔버스 비우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 그리기 스타일 재설정
    ctx.lineWidth = 2;
    ctx.lineCap   = 'round';
    ctx.strokeStyle = '#000';
    // 저장된 모든 스트로크를 다시 그림
    strokesRef.current.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (initialStrokes && initialStrokes.length) {
      strokesRef.current = initialStrokes;
      redrawAllStrokes();
    }
  }, [initialStrokes]);

  useEffect(() => {
    fetch('../../mocks/strokes.json')
      .then(res => res.json())
      .then(data => {
        strokesRef.current = data.strokes;
        redrawAllStrokes();
      });
  }, []); // 빈 deps로, 새로고침마다 실행  
  // ----------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
      const dx = bx-ax, dy = by-ay, len2 = dx*dx+dy*dy;
      if (len2===0) return Math.hypot(px-ax, py-ay);
      let t = ((px-ax)*dx + (py-ay)*dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + t*dx, cy = ay + t*dy;
      return Math.hypot(px-cx, py-cy);
    };

    const eraseStroke = (x: number, y: number) => {
      const TH = 5;
      const idx = strokesRef.current.findIndex(stroke =>
        stroke.some((p,i)=> i<stroke.length-1 && getDist(x,y,p.x,p.y,stroke[i+1].x,stroke[i+1].y)<=TH)
      );
      if (idx!==-1) {
        strokesRef.current.splice(idx,1);
        const ctx = ctxRef.current; if (!ctx) return;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.lineWidth = 2; ctx.lineCap='round'; ctx.strokeStyle='#000';
        strokesRef.current.forEach(s=>{
          if (s.length<2) return;
          ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y);
          s.slice(1).forEach(pt=> ctx.lineTo(pt.x,pt.y));
          ctx.stroke();
        });
      }
    };

    const start = (e: PointerEvent) => {
      if (!['pen','mouse'].includes(e.pointerType)) return;
      isDrawingRef.current = true;
      if (mode==='draw') {
        const ctx = ctxRef.current; if (!ctx) return;
        ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY);
        currentStrokeRef.current = [{ x:e.offsetX, y:e.offsetY }];
      }
    };
    const draw = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      const ctx = ctxRef.current; if (!ctx) return;
      if (mode==='erase') {
        eraseStroke(e.offsetX,e.offsetY);
      } else {
        ctx.lineTo(e.offsetX,e.offsetY);
        ctx.stroke();
        currentStrokeRef.current.push({ x:e.offsetX, y:e.offsetY });
      }
    };
    const stop = () => {
      if (isDrawingRef.current && mode==='draw') {
        strokesRef.current.push([...currentStrokeRef.current]);
        currentStrokeRef.current = [];
      }
      isDrawingRef.current = false;
    };

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', stop);
      canvas.removeEventListener('pointercancel', stop);
    };
  }, [mode]);

  return (
    <div className="w-1/2 relative">
      <div className="absolute top-6 left-4 flex gap-3.5">
        <p className="headline-small text-gray-700">{title}</p>
        <div className="flex gap-3">
          <Pencil
            className={mode==='draw' ? 'bg-gray-200 rounded-full' : ''}
            onClick={() => setMode('draw')}
          />
          <Eraser
            className={mode==='erase' ? 'bg-gray-200 rounded-full' : ''}
            onClick={() => setMode('erase')}
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
