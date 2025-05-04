import { useEffect, useRef, useState } from "react";
import { sendProblemSolvingDataApi } from "@/services/api/ProblemSolving";
import { getRelativePointerPosition } from "@/utils/drawing";
import { useEraser } from "@/hooks/useEraser";
import { useHandlePointerUp } from "@/hooks/useHandlePointerUp";

const AnswerArea = () => {
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
  const { eraseNearPointer, eraseLastStroke, eraseAll } = useEraser();
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
      if (e.pointerType === "touch") return; // 손가락/손바닥 무시
      if (eraseMode) {
        const { x, y } = getRelativePointerPosition(e, canvas); // 해당 요소의 캔버스 내 좌표
        eraseNearPointer({
          x,
          y,
          blocks,
          strokes,
          setStrokes,
          setBlocks,
          setLastPoint,
          setLastStrokeTime,
          setLastBlockId,
          drawAllAtOnce,
        });
        return;
      }

      setDrawing(true);
      const startPoint = { x: e.offsetX, y: e.offsetY, time: Date.now() };
      currentStrokeRef.current = [startPoint];
      ctx.beginPath(); // 이전 선과 분리된 새 경로 시작
      ctx.moveTo(startPoint.x, startPoint.y); // 새 선의 시작점 지정
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
    const pointerUpHandler = () => {
      handlePointerUp({
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
    };
    const handlePointerUp = useHandlePointerUp();
    canvas.addEventListener("pointerup", pointerUpHandler);

    const canvasEl = canvasRef.current!;
    canvasEl.addEventListener("pointerdown", handlePointerDown);
    canvasEl.addEventListener("pointermove", handlePointerMove);
    // canvasEl.addEventListener("pointerup", handlePointerUp);

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

  // 전체 블록 다시 그리기
  const drawAllAtOnce = (targetBlocks = blocks) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화

    // ✅ 배경을 먼저 흰색으로 칠해줌
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 각 블록을 순회하며 그리기
    for (const block of targetBlocks) {
      for (const stroke of block.strokes) {
        const isLong = stroke.duration > 2000;
        ctx.strokeStyle = isLong ? "red" : "black";
        ctx.lineWidth = isLong ? 3 : 1.5;

        // 각 획을 그리기
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

  // 채점(제출) 핸들러 - 이미지와 JSON 생성

  const handleSubmit = async () => {
    if (!canvasRef.current) return;

    drawAllAtOnce(); // 전체 stroke 그리기
    const canvas = canvasRef.current;
    const formData = new FormData();

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg")
    );

    formData.append("files", blob, "answer.jpg");

    const now = Date.now();
    const totalSolveTime = now - enterTime.current;

    formData.append("user_id", String(1));
    formData.append("problem_id", String(1));
    formData.append("answer", JSON.stringify({ file_name: "answer.jpg" }));
    formData.append(
      "total_solve_time",
      String(Math.round(totalSolveTime / 1000))
    );

    const result = await sendProblemSolvingDataApi(formData);
    console.log("제출 완료:", result);
  };
  return (
    <div className="flex items-center justify-center w-full h-[200px] relative border border-gray-200 rounded-[10px]">
      {/* <p className="body-medium text-gray-200">정답을 작성해주세요.</p> */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() =>
            eraseAll({
              canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
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
          onClick={eraseLastStroke({
            blocks,
            strokes,
            setBlocks,
            setStrokes,
            setLastPoint,
            setLastStrokeTime,
            setLastBlockId,
            drawAllAtOnce,
          })}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          한 획 지우기
        </button>

        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-blue-200 border rounded"
        >
          채점하기
        </button>
        <button
          onClick={() => {
            console.log(JSON.stringify(blocks, null, 2));
            alert("블록 데이터가 콘솔에 출력되었습니다!");
          }}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          데이터 저장
        </button>
        <button
          onClick={async () => {
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
          }}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 재생
        </button>
        <button
          onClick={() => drawAllAtOnce()}
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
        // width={800}
        // height={600}
        className="border border-gray-300 touch-none"
      />
    </div>
  );
};

export default AnswerArea;
