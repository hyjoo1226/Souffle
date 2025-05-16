// SolutionNote.tsx(오답노트)에 들어가는 필기 영역을 구현한 컴포넌트
import { useState, useEffect, useRef } from 'react';
import { ReactComponent as Eraser } from "@/assets/icons/Eraser.svg";
import { ReactComponent as Pencil } from "@/assets/icons/Pencil.svg";
import { ReactComponent as Close } from "@/assets/icons/Close.svg";

type Mode = 'draw' | 'erase';

// 한 점의 좌표를 0~1 범위로 정규화하여 저장
interface Point {
  x: number;  // 정규화된 X 좌표 (0~1)
  y: number;  // 정규화된 Y 좌표 (0~1)
}

interface CanvasAreaProps {
  title: string;
  initialStrokes?: Point[][];  // 정규화된 초기 스트로크
  onStrokesChange?: (strokes: Point[][]) => void;
}

export default function CanvasArea({ title, initialStrokes, onStrokesChange }: CanvasAreaProps) {
  const [mode, setMode] = useState<Mode>('draw');
  const canvasRef        = useRef<HTMLCanvasElement|null>(null);
  const ctxRef           = useRef<CanvasRenderingContext2D|null>(null);
  const isDrawingRef     = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const strokesRef       = useRef<Point[][]>([]);

  const [showEraserModal, setShowEraserModal] = useState(false);
  const handleEraserClick = () => {
    if (mode === 'erase') {
      setShowEraserModal(true);
    } else {
      setMode('erase');
    }
  };
  const handlePencilClick = () => {
    if (showEraserModal === true) {
      setShowEraserModal(false);
    } 
    setMode('draw');
  };

  // 저장된 스트로크를 현재 캔버스 크기에 맞춰 다시 그리기
  const redrawAllStrokes = () => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 2;
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctx.strokeStyle = '#000';

    strokesRef.current.forEach(stroke => {
      if (stroke.length < 1) return;
      ctx.beginPath();
      // 첫 점
      ctx.moveTo(stroke[0].x * w, stroke[0].y * h);
      for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1];
        const curr = stroke[i];
        const x1 = prev.x * w, y1 = prev.y * h;
        const x2 = curr.x * w, y2 = curr.y * h;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.quadraticCurveTo(x1, y1, midX, midY);
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x * w, last.y * h);
      ctx.stroke();
    });
  };

  // "전체 지우기" 동작 함수
  const handleClearAll = () => {
    strokesRef.current = [];
    redrawAllStrokes();
    setShowEraserModal(false);
  }

  // "이전 지우기" 동작 함수
  const handleRemoveLastStroke = () => {
    if (strokesRef.current.length > 0) {
      strokesRef.current.pop();
      redrawAllStrokes();
    }
    setShowEraserModal(false);
  }

  // props로 받은 초기 스트로크 복원
  useEffect(() => {
    if (initialStrokes && initialStrokes.length) {
      strokesRef.current = initialStrokes;
      redrawAllStrokes();
    }
  }, [initialStrokes]);

  useEffect(() => {
    if (onStrokesChange) {
      onStrokesChange(strokesRef.current); // 필기 내용이 변경될 때마다 전달
    }
  }, [strokesRef.current]);

  // 캔버스 초기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap   = 'round';
    ctx.strokeStyle = '#000';
    ctxRef.current  = ctx;
  }, []);

  // 그리기/지우기 이벤트 핸들러
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 스트로크 삭제 로직
    const eraseStroke = (x:number, y:number) => {
      const w = canvas.width;
      const h = canvas.height;
      const idx = strokesRef.current.findIndex(stroke =>
        stroke.some((pt, i) => {
          if (i === stroke.length - 1) return false;
          const x1 = pt.x * w, y1 = pt.y * h;
          const x2 = stroke[i+1].x * w, y2 = stroke[i+1].y * h;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const t = ((x - x1) * dx + (y - y1) * dy) / (dx*dx + dy*dy);
          const clamped = Math.max(0, Math.min(1, t));
          const cx = x1 + clamped * dx;
          const cy = y1 + clamped * dy;
          return Math.hypot(x - cx, y - cy) <= 5;
        })
      );
      if (idx !== -1) {
        strokesRef.current.splice(idx, 1);
        redrawAllStrokes();
      }
    };

    const start = (e: PointerEvent) => {
      if (!['pen','mouse'].includes(e.pointerType)) return;
      isDrawingRef.current = true;
      if (mode === 'draw') {
        const w = canvas.width;
        const h = canvas.height;
        const nx = e.offsetX / w;
        const ny = e.offsetY / h;
        currentStrokeRef.current = [{ x: nx, y: ny }];
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      }
    };

    const draw = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (mode === 'erase') {
        eraseStroke(e.offsetX, e.offsetY);
      } else {
        const w = canvas.width;
        const h = canvas.height;
        const nx = e.offsetX / w;
        const ny = e.offsetY / h;
        currentStrokeRef.current.push({ x: nx, y: ny });
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    };

    const stop = () => {
      if (isDrawingRef.current && mode === 'draw') {
        strokesRef.current.push([...currentStrokeRef.current]);
        currentStrokeRef.current = [];

        // stroke 변경을 외부로 전달!
        if (onStrokesChange) {
          onStrokesChange([...strokesRef.current]);
        }
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

  useEffect(() => {
    if (initialStrokes && initialStrokes.length) {
      strokesRef.current = initialStrokes;
      redrawAllStrokes();
    }
  }, [initialStrokes]);

  return (
    <div className="w-1/2 relative">
      <div className="absolute top-6 left-4 flex gap-3.5">
        <p className="headline-small text-gray-700">{title}</p>
        <div className="flex gap-3">
          <Pencil
            className={mode==='draw' ? 'bg-gray-200 rounded-full' : ''}
            onClick={handlePencilClick}
          />
          <Eraser
            className={mode==='erase' ? 'bg-gray-200 rounded-full' : ''}
            onClick={handleEraserClick}
          />
        </div>
      </div>
      {showEraserModal && (
        <div className="absolute top-6 left-42.5 bg-white figma-shadow rounded-lg p-3.5 z-50 border border-gray-100">
          <div className="flex justify-between items-center mb-5 gap-x-34">
            <p className="headline-small text-gray-700">지우개</p>
            <Close onClick={() => setShowEraserModal(false)} className="text-gray-700" />
          </div>
          <div className="flex flex-col gap-5 items-center">
            <label className="flex items-center gap-3 cursor-pointer" onClick={handleRemoveLastStroke}>
              <input type="radio" name="erase-option" readOnly />
              <span className="body-small text-gray-700">이전 지우기</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer" onClick={handleClearAll}>
              <input type="radio" name="erase-option" readOnly />
              <span className="body-small text-gray-700">전체 지우기</span>
            </label>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
