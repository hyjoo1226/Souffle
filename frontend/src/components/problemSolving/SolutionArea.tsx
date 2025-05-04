import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { sendProblemSolvingDataApi } from "@/services/api/ProblemSolving";
import {
  drawBlocksOnCanvas,
  getPointerUpHandler,
  generateStepImages,
} from "@/utils/drawing";
// import { useEraser } from "@/hooks/useEraser";
import {
  getRelativePointerPosition,
  findStrokeNearPointer,
  eraseStrokeById,
  updateLastStrokeMetaAfterErase,
  eraseAll,
  eraseLastStroke,
} from "@/utils/eraser";

const SolutionArea = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 현재 그리고 있는 획을 담을 임시 저장소입니다.
  const currentStrokeRef = useRef<any[]>([]);

  // 전체 획, 블록, 그리고 기타 상태들입니다.
  const [strokes, setStrokes] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);
  const [lastStrokeTime, setLastStrokeTime] = useState<number | null>(null);
  const [lastPoint, setLastPoint] = useState<any>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [lastBlockId, setLastBlockId] = useState<number | null>(null);
  // const { eraseNearPointer, eraseLastStroke, eraseAll } = useEraser();
  // const [enterTime, setEnterTime] = useState<number>(Date.now()); // 페이지 입장 시
  // const [firstStrokeTime, setFirstStrokeTime] = useState<number | null>(null); // 첫 그리기 시작 시
  // const [lastStrokeEndTime, setLastStrokeEndTime] = useState<number | null>(
  //   null
  // ); // 마지막 stroke 끝난 시점
  const [submitTime, setSubmitTime] = useState<number | null>(null); // 채점 버튼 클릭 시
  const enterTime = useRef(Date.now());
  const firstStrokeTime = useRef<number | null>(null);
  const lastStrokeEndTime = useRef<number | null>(null);
  // 초기 캔버스 이벤트 바인딩
  useEffect(() => {
    // setEnterTime(Date.now());
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";

    // 그리기 시작
    const handlePointerDown = (e: PointerEvent) => {
      if (!firstStrokeTime.current) {
        firstStrokeTime.current = Date.now();
      }
      if (e.pointerType === "touch") return;

      if (eraseMode) {
        const { x, y } = getRelativePointerPosition(e, canvas);
        const nearStrokeId = findStrokeNearPointer({
          x,
          y,
          blocks,
          strokes,
          useBlock: true,
        });

        if (nearStrokeId !== null) {
          const { updatedStrokes, updatedBlocks } = eraseStrokeById({
            nearStrokeId,
            strokes,
            blocks,
            setStrokes,
            setBlocks,
            canvas,
            useBlock: true,
          });

          updateLastStrokeMetaAfterErase({
            updatedStrokes,
            blocks: updatedBlocks,
            setLastPoint,
            setLastStrokeTime,
            setLastBlockId,
            useBlock: true,
          });
        }

        return;
      }

      setDrawing(true);
      const startPoint = { x: e.offsetX, y: e.offsetY, time: Date.now() };
      currentStrokeRef.current = [startPoint];
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
    };

    // 선 그리기 중
    const handlePointerMove = (e: PointerEvent) => {
      if (!drawing || eraseMode) return;
      const point = { x: e.offsetX, y: e.offsetY, time: Date.now() };
      currentStrokeRef.current.push(point);
      ctx.lineTo(point.x, point.y); // 이후 선을 긋기 시작
      ctx.stroke(); // 실제 그리기
    };

    // 그리기 종료 및 블록 판단
    const pointerUpHandler = getPointerUpHandler({
      eraseMode,
      currentStrokeRef,
      strokes,
      blocks,
      lastPoint,
      lastStrokeTime,
      lastBlockId,
      lastStrokeEndTime,
      setStrokes,
      setBlocks,
      setLastPoint,
      setLastStrokeTime,
      setLastBlockId,
      setCurrentStroke,
      setDrawing,
    });
    const canvasEl = canvasRef.current!;

    canvasEl.addEventListener("pointerdown", handlePointerDown);
    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerup", pointerUpHandler);

    return () => {
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerup", pointerUpHandler);
    };
  }, [
    drawing,
    strokes,
    blocks,
    currentStroke,
    lastPoint,
    lastStrokeTime,
    eraseMode,
    lastBlockId,
  ]);

  // 채점(제출) 핸들러 - 이미지와 JSON 생성

  useImperativeHandle(ref, () => ({
    getStepData: async () => {
      if (!canvasRef.current) return null;

      const stepsData = await generateStepImages(blocks, canvasRef.current);

      const stepMeta = stepsData.map(
        ({ step_number, step_time, file_name }) => ({
          step_number,
          step_time,
          file_name,
        })
      );

      const now = Date.now();
      const totalSolveTime = now - enterTime.current;
      const understandTime = Math.max(
        0,
        firstStrokeTime.current
          ? firstStrokeTime.current - enterTime.current
          : 0
      );
      const solveTime = Math.max(
        0,
        firstStrokeTime.current
          ? (lastStrokeEndTime.current ?? now) - firstStrokeTime.current
          : 0
      );
      const reviewTime = Math.max(
        0,
        lastStrokeEndTime.current ? now - lastStrokeEndTime.current : 0
      );

      return {
        stepsData,
        stepMeta,
        timing: {
          totalSolveTime: Math.round(totalSolveTime / 1000),
          understandTime: Math.round(understandTime / 1000),
          solveTime: Math.round(solveTime / 1000),
          reviewTime: Math.round(reviewTime / 1000),
        },
      };
    },
  }));

  return (
    <div className="w-full h-full relative border border-gray-200 rounded-[10px] p-4">
      <img
        src="/icons/note-spring.png"
        alt="노트 스프링"
        className="absolute left-[12.5%] top-[-4%] w-[70%] pointer-events-none"
      />
      <div className="flex gap-2 mb-2">
        <button
          onClick={() =>
            eraseAll({
              canvas: canvasRef.current!,
              setStrokes,
              setBlocks,
              setLastPoint,
              setLastStrokeTime,
              setLastBlockId,
            })
          }
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 지우기
        </button>
        <button
          onClick={() =>
            eraseLastStroke({
              strokes,
              blocks,
              setBlocks,
              setStrokes,
              setLastPoint,
              setLastStrokeTime,
              setLastBlockId,
              canvas: canvasRef.current!,
            })
          }
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          한 획 지우기
        </button>

        {/* <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-blue-200 border rounded"
        >
          채점하기
        </button> */}
        <button
          onClick={() => drawBlocksOnCanvas(canvasRef.current!, blocks)}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 이미지 보기
        </button>
        <button
          onClick={() => setEraseMode(!eraseMode)}
          className={`px-3 py-1 border rounded ${
            eraseMode ? "bg-red-200" : "bg-gray-100"
          }`}
        >
          {eraseMode ? "지우기 모드 끄기" : "지우기 모드 켜기"}
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {blocks.map((block) => (
          <button
            key={block.block_id}
            onClick={async () => {
              setActiveBlockId(block.block_id);
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;

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
});

export default SolutionArea;
