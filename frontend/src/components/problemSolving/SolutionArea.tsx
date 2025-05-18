import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  getPointerUpHandler,
  generateStepImages,
  generateFullStepImage,
} from "@/utils/drawing";
import {
  getRelativePointerPosition,
  findStrokeNearPointer,
  eraseStrokeById,
  updateLastStrokeMetaAfterErase,
  eraseAll,
  eraseLastStroke,
} from "@/utils/eraser";
import Eraser from "./Eraser";

const SolutionArea = forwardRef((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentStrokeRef = useRef<any[]>([]);
  const erasedStrokesRef = useRef<Set<number>>(new Set());

  const [strokes, setStrokes] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);
  const [lastStrokeTime, setLastStrokeTime] = useState<number | null>(null);
  const [lastPoint, setLastPoint] = useState<any>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [lastBlockId, setLastBlockId] = useState<number | null>(null);
  const [isPencilActive, setIsPencilActive] = useState(true); // 기본: 펜 선택됨
  const [isEraserActive, setIsEraserActive] = useState(false); // 아이콘 상태
  const [showEraseModal, setShowEraseModal] = useState(false); // 모달 표시
  const [eraseOption, setEraseOption] = useState<"all" | "last" | null>(null);
  const enterTime = useRef(Date.now());
  const firstStrokeTime = useRef<number | null>(null);
  const lastStrokeEndTime = useRef<number | null>(null);
  const blockSnapshotsRef = useRef<any[]>([]);
  const lastSavedBlocksRef = useRef<any[]>([]); // 항상 최신 blocks 상태 백업

  const handleEraserClick = () => {
    if (!isEraserActive) {
      // 처음 클릭 → 지우개 모드 ON
      if (blocks.length > 0) {
        blockSnapshotsRef.current.push(JSON.parse(JSON.stringify(blocks)));
      }
      setEraseOption(null); // 지우개 옵션 초기화
      setIsPencilActive(false); // 펜 아이콘 비활성화
      setIsEraserActive(true);
      setEraseMode(true); // canvas에서 지우개 기능 활성화
    } else {
      // 두 번째 클릭 → 옵션 모달 열기
      setShowEraseModal(true);
    }
  };
  const handlePencilClick = () => {
    setIsPencilActive(true);
    setEraseMode(false); // 지우기 모드 종료
    setIsEraserActive(false); // 지우개 아이콘 비활성화
    setShowEraseModal(false); // 혹시 열려 있다면 모달도 닫기
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();

      // 실제 픽셀 해상도도 일치시킴
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
      }
    };

    resizeCanvas(); // 처음 mount 시

    // resize 이벤트가 필요한 경우
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    // 블록 또는 strokes 변경될 때마다 현재 상태 백업
    if (blocks.length > 0) {
      lastSavedBlocksRef.current = JSON.parse(JSON.stringify(blocks));
    }
  }, [blocks]);

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
        erasedStrokesRef.current.clear();
        const { x, y } = getRelativePointerPosition(e, canvas);
        const nearStrokeId = findStrokeNearPointer({
          x,
          y,
          blocks,
          strokes,
          useBlock: true,
        });

        if (nearStrokeId !== null) {
          erasedStrokesRef.current.add(nearStrokeId);
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
      if (eraseMode) {
        const { x, y } = getRelativePointerPosition(e, canvas);
        const nearStrokeId = findStrokeNearPointer({
          x,
          y,
          blocks,
          strokes,
          useBlock: true,
        });

        if (
          nearStrokeId !== null &&
          !erasedStrokesRef.current.has(nearStrokeId)
        ) {
          erasedStrokesRef.current.add(nearStrokeId);

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
      blockSnapshotsRef,
      lastSavedBlocksRef,
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
      if (!blockSnapshotsRef.current) return null;
      const latestSnapshot = blockSnapshotsRef.current.at(-1);
      const currentFinal = JSON.parse(JSON.stringify(blocks));

      if (JSON.stringify(latestSnapshot) !== JSON.stringify(currentFinal)) {
        blockSnapshotsRef.current.push(currentFinal); // ✅ 강제 추가
      }

      const stepsData = await generateStepImages(
        blockSnapshotsRef.current,
        canvasRef.current,
        blocks
      );
      const fullStep = await generateFullStepImage(canvasRef.current, blocks);

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
        fullStep,
        stepMeta,
        timing: {
          totalSolveTime: Math.round(totalSolveTime / 1000),
          understandTime: Math.round(understandTime / 1000),
          solveTime: Math.round(solveTime / 1000),
          reviewTime: Math.round(reviewTime / 1000),
        },
        blockSnapshots: blockSnapshotsRef.current,
        lastSavedBlocks: lastSavedBlocksRef.current,
      };
    },
  }));

  return (
    <div className="w-full h-full relative border border-gray-200 rounded-[10px]">
      <img
        src="/icons/note-spring.png"
        alt="노트 스프링"
        className="absolute z-50 left-[12.5%] top-[-4%] w-[70%] pointer-events-none"
      />
      {showEraseModal && (
        <Eraser
          eraseOption={eraseOption}
          setEraseOption={setEraseOption}
          onClose={() => {
            setShowEraseModal(false);
            setEraseOption(null); // 선택 초기화
          }}
          onExecute={(option) => {
            if (option === "last") {
              eraseLastStroke({
                strokes,
                blocks,
                setBlocks,
                setStrokes,
                setLastPoint,
                setLastStrokeTime,
                setLastBlockId,
                canvas: canvasRef.current!,
              });
            } else {
              eraseAll({
                canvas: canvasRef.current!,
                setStrokes,
                setBlocks,
                setLastPoint,
                setLastStrokeTime,
                setLastBlockId,
              });
            }

            setShowEraseModal(false);
            setIsEraserActive(false);
            setEraseMode(false);
          }}
        />
      )}
      <div className="relative w-full h-full overflow-hidden border border-gray-200 rounded-[10px] p-2">
        <div className="flex justify-end gap-2 mb-2 overflow-hidden">
          <img
            src={
              isPencilActive
                ? "/icons/pencil-selected.png"
                : "/icons/pencil-default.png"
            }
            alt="연필"
            className="w-7 h-7 cursor-pointer"
            onClick={handlePencilClick}
          />
          <div className="relative inline-block">
            <img
              src={
                isEraserActive
                  ? "/icons/eraser-selected.png"
                  : "/icons/eraser-default.png"
              }
              alt="지우개"
              className="w-7 h-7 cursor-pointer"
              onClick={handleEraserClick}
            />
          </div>
        </div>
        <div className="relative w-full h-full ">
          <canvas
            id="drawCanvas"
            ref={canvasRef}
            className="touch-none w-full h-full"
          />
        </div>
      </div>
    </div>
  );
});

export default SolutionArea;
