import { useEffect, useRef, useState } from "react";

const SolutionArea = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentStrokeRef = useRef<any[]>([]);

  const [strokes, setStrokes] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);
  const [lastStrokeTime, setLastStrokeTime] = useState<number | null>(null);
  const [lastPoint, setLastPoint] = useState<any>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";

    const handlePointerDown = (e: PointerEvent) => {
      setDrawing(true);
      const startPoint = { x: e.offsetX, y: e.offsetY, time: Date.now() };
      currentStrokeRef.current = [startPoint];
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!drawing) return;
      const point = { x: e.offsetX, y: e.offsetY, time: Date.now() };
      currentStrokeRef.current.push(point);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    };

    const handlePointerUp = () => {
      setDrawing(false);
      if (currentStrokeRef.current.length <= 1) return;

      const now = Date.now();
      const first = currentStrokeRef.current[0];
      const last = currentStrokeRef.current.at(-1);
      const duration = last.time - first.time;
      const distance = lastPoint
        ? Math.hypot(last.x - lastPoint.x, last.y - lastPoint.y)
        : 0;
      const timeGap = lastStrokeTime ? first.time - lastStrokeTime : 0;

      const strokeData = {
        stroke_id: strokes.length + 1,
        timestamp: now,
        points: [...currentStrokeRef.current],
        duration,
        start: first,
        end: last,
      };

      const newStrokes = [...strokes, strokeData];
      setStrokes(newStrokes);

      const NEW_BLOCK =
        !lastStrokeTime ||
        timeGap > 3000 ||
        distance > 100 ||
        blocks.length === 0;

      let newBlocks = [...blocks];
      if (NEW_BLOCK) {
        const block = {
          block_id: newBlocks.length + 1,
          strokes: [strokeData],
        };
        newBlocks.push(block);
      } else {
        newBlocks[newBlocks.length - 1].strokes.push(strokeData);
      }

      setBlocks(newBlocks);
      setLastPoint(last);
      setLastStrokeTime(now);
      setCurrentStroke([]);
    };

    const canvasEl = canvasRef.current!;
    canvasEl.addEventListener("pointerdown", handlePointerDown);
    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drawing, strokes, blocks, currentStroke, lastPoint, lastStrokeTime]);

  const replayBlock = async (id: number) => {
    console.log("▶️ replayBlock called with id:", id);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const block = blocks.find((b) => b.block_id === id);
    if (!block) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of block.strokes) {
      const isLong = stroke.duration > 2000;
      ctx.strokeStyle = isLong ? "red" : "black";
      ctx.lineWidth = isLong ? 3 : 1.5;

      ctx.beginPath();
      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
        if (i % 2 === 0) await new Promise((r) => setTimeout(r, 10));
      }
      ctx.stroke();
    }
  };

  const drawAllAtOnce = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const block of blocks) {
      for (const stroke of block.strokes) {
        const isLong = stroke.duration > 2000;
        ctx.strokeStyle = isLong ? "red" : "black";
        ctx.lineWidth = isLong ? 3 : 1.5;

        ctx.beginPath();
        for (let i = 0; i < stroke.points.length; i++) {
          const p = stroke.points[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
    }
  };

  const handleClear = () => {
    canvasRef.current?.getContext("2d")?.clearRect(0, 0, 800, 600);
    setStrokes([]);
    setBlocks([]);
    setLastPoint(null);
    setLastStrokeTime(null);
    setActiveBlockId(null);
  };

  const handleSave = () => {
    console.log(JSON.stringify(blocks, null, 2));
    alert("블록 데이터가 콘솔에 출력되었습니다!");
  };

  const handleReplayAll = async () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const block of blocks) {
      for (const stroke of block.strokes) {
        const isLong = stroke.duration > 2000;
        ctx.strokeStyle = isLong ? "red" : "black";
        ctx.lineWidth = isLong ? 3 : 1.5;

        ctx.beginPath();
        for (let i = 0; i < stroke.points.length; i++) {
          const p = stroke.points[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
          if (i % 2 === 0) await new Promise((r) => setTimeout(r, 10));
        }
        ctx.stroke();
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    setActiveBlockId(null);
  };

  return (
    <div className="w-full h-full relative border border-gray-200 rounded-[10px] p-4">
      <img
        src="/icons/note-spring.png"
        alt="노트 스프링"
        className="absolute left-[12.5%] top-[-4%] w-[70%] pointer-events-none"
      />
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 지우기
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          데이터 저장
        </button>
        <button
          onClick={handleReplayAll}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 재생
        </button>
        <button
          onClick={drawAllAtOnce}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 이미지 보기
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {blocks.map((block) => (
          <button
            key={block.block_id}
            onClick={() => {
              setActiveBlockId(block.block_id);
              replayBlock(block.block_id);
            }}
            className="m-1 px-2 py-1 border rounded text-sm"
          >
            수식 {block.block_id}
          </button>
        ))}
      </div>
      <canvas
        id="drawCanvas"
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 touch-none"
      />
    </div>
  );
};

export default SolutionArea;
