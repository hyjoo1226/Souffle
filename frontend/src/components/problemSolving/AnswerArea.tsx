import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { getPointerUpHandler, generateAnswerImage } from "@/utils/drawing";
import {
  getRelativePointerPosition,
  findStrokeNearPointer,
  eraseStrokeById,
  updateLastStrokeMetaAfterErase,
  eraseAll,
  eraseLastStroke,
} from "@/utils/eraser";
import Eraser from "./Eraser";

const AnswerArea = forwardRef((_props, ref) => {
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
  const [eraseMode, setEraseMode] = useState(false);
  const [isPencilActive, setIsPencilActive] = useState(true); // 기본: 펜 선택됨
  const [isEraserActive, setIsEraserActive] = useState(false); // 아이콘 상태
  const [showEraseModal, setShowEraseModal] = useState(false); // 모달 표시
  const [eraseOption, setEraseOption] = useState<"all" | "last" | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const blockSnapshotsRef = useRef<any[]>([]);
  const lastSavedBlocksRef = useRef<any[]>([]); // 항상 최신 blocks 상태 백업

  const [lastBlockId, setLastBlockId] = useState<number | null>(null);

  const enterTime = useRef(Date.now());
  const firstStrokeTime = useRef<number | null>(null);
  const lastStrokeEndTime = useRef<number | null>(null);

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

  const handleEraserClick = () => {
    if (!isEraserActive) {
      setEraseOption(null); // 지우개 옵션 초기화
      // 처음 클릭 → 지우개 모드 ON
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
  // 초기 캔버스 이벤트 바인딩
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";

    // 그리기 시작
    const handlePointerDown = (e: PointerEvent) => {
      if (!hasStarted) setHasStarted(true);
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
            useBlock: false,
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
    getAnswerBlob: async () => {
      if (!canvasRef.current) return null;
      return await generateAnswerImage(canvasRef.current, blocks);
    },
    getTimingData: () => ({
      enterTime: enterTime.current,
      firstStrokeTime: firstStrokeTime.current,
      lastStrokeEndTime: lastStrokeEndTime.current,
    }),
    getBlocks: () => blocks,
  }));

  return (
    <div className="flex flex-col items-end justify-center w-full h-[200px] relative  rounded-[10px]">
      <div className="flex gap-2 mb-2">
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

          {showEraseModal && (
            <Eraser
              eraseOption={eraseOption}
              setEraseOption={setEraseOption}
              onClose={() => setShowEraseModal(false)}
              onExecute={() => {
                if (eraseOption === "last") {
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
        </div>
      </div>
      <div className="relative w-full h-full ">
        <canvas
          id="drawCanvas"
          ref={canvasRef}
          // width={800} // 또는 원하는 고정 px
          // height={200}
          className="border border-gray-200 rounded-[10px] touch-none w-full h-full"
        />
      </div>
      {!hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none body-medium text-gray-200">
          정답을 작성해주세요
        </div>
      )}
    </div>
  );
});

export default AnswerArea;
