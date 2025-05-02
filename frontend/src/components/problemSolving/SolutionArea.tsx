import { useEffect, useRef, useState } from "react";

const SolutionArea = () => {
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

  // 초기 캔버스 이벤트 바인딩
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";

    // 그리기 시작
    const handlePointerDown = (e: PointerEvent) => {
      if (eraseMode) {
        const rect = canvas.getBoundingClientRect(); //canvas 요소의 위치와 크기 정보, 브라우저 창 기준에서의 canvas 위치와 크기
        const x = e.clientX - rect.left; // canvas 내부 좌표계 기준의 x좌표
        const y = e.clientY - rect.top; // canvas 내부 좌표계 기준의 y좌표
        const threshold = 20; // 지우기 반경(20px 이하)

        //모든 block을 돌면서,
        //block 안의 stroke를 하나씩 보고,
        //그 stroke의 선분 하나하나를 확인하며,
        //포인터와의 거리가 가까우면 해당 stroke 삭제
        for (const block of blocks) {
          for (const stroke of block.strokes) {
            for (let i = 0; i < stroke.points.length - 1; i++) {
              const p1 = stroke.points[i];
              const p2 = stroke.points[i + 1];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = Math.hypot(dx, dy); //선분의 길이 (피타고라스: √(dx² + dy²))
              if (len === 0) continue;
              const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len); // 선분 위의 점을 찾기 위한 비율(0이면 p1, 1이면 p2, 0~1 사이면 선분 위)
              if (t < 0 || t > 1) continue; // t가 0보다 작거나 1보다 크면 선분 바깥임

              // 실제 선분 위에서 포인터와 가장 가까운 점
              const projX = p1.x + t * dx;
              const projY = p1.y + t * dy;

              // 거리(dist)가 일정 threshold보다 작으면 "이 선에 닿았다고 판단"해서 해당 stroke를 삭제
              const dist = Math.hypot(x - projX, y - projY);
              if (dist < threshold) {
                const updatedBlocks = blocks
                  .map((b) => ({
                    ...b,
                    strokes: b.strokes.filter(
                      (s) => s.stroke_id !== stroke.stroke_id
                    ),
                  }))
                  .filter((b) => b.strokes.length > 0);
                setBlocks(updatedBlocks);

                const updatedStrokes = strokes.filter(
                  (s) => s.stroke_id !== stroke.stroke_id
                );
                setStrokes(updatedStrokes);

                const last = updatedStrokes.at(-1);
                if (last) {
                  setLastPoint(last.end);
                  setLastStrokeTime(last.timestamp);
                  const containingBlock = updatedBlocks.find((b) =>
                    b.strokes.some((s) => s.stroke_id === last.stroke_id)
                  );
                  setLastBlockId(containingBlock?.block_id ?? null);
                } else {
                  setLastPoint(null);
                  setLastStrokeTime(null);
                  setLastBlockId(null);
                }

                drawAllAtOnce();
                return;
              }
            }
          }
        }
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
    const handlePointerUp = () => {
      if (eraseMode) return;
      setDrawing(false);
      if (currentStrokeRef.current.length <= 1) return;

      const now = Date.now();
      const first = currentStrokeRef.current[0]; // 획을 그리기 시작한 첫 지점의 정보
      const last = currentStrokeRef.current.at(-1); // 획을 그리기 끝낸 마지막 지점의 정보
      const duration = last.time - first.time;

      // 블록 분리 조건
      const distance = lastPoint
        ? Math.hypot(last.x - lastPoint.x, last.y - lastPoint.y)
        : 0; //이전 획의 끝점(lastPoint)과 현재 획의 시작점(first) 사이 거리
      const timeGap = lastStrokeTime ? first.time - lastStrokeTime : 0; // 이전 획을 끝낸 시간과 지금 획을 시작한 시간의 간격
      const movedLeft = lastPoint && first.x < lastPoint.x - 10; // x축이 왼쪽으로 이동
      const movedDown = lastPoint && first.y > lastPoint.y + 10; // y축이 아래로 이동

      const tooFar = distance > 100; // 100px 이상 멀어짐
      const longPause = timeGap > 3000; // 3초 이상 멈춤
      const newLineDetected = movedLeft && movedDown; // 왼쪽으로 이동 후 아래로 이동(줄바꿈)

      // 하나의 획에 대한 정보
      const strokeData = {
        stroke_id: strokes.length + 1,
        timestamp: now,
        points: [...currentStrokeRef.current],
        duration,
        start: first,
        end: last,
      };

      const newStrokes = [...strokes, strokeData]; // 기존 배열에 새로운 획을 추가
      setStrokes(newStrokes); // 전체 획 배열 업데이트

      let newBlocks = [...blocks];
      if (
        blocks.length === 0 || // 블록이 없거나
        longPause ||
        tooFar ||
        newLineDetected || // 줄바꿈 감지 조건
        !newBlocks.find((b) => b.block_id === lastBlockId)
      ) {
        // 새 블록 생성
        const newBlockId = newBlocks.length + 1;
        const block = {
          block_id: newBlockId,
          strokes: [strokeData],
        };
        newBlocks.push(block);
        setLastBlockId(newBlockId);
      } else {
        // 기존 블록에 추가
        const lastBlock = newBlocks.find((b) => b.block_id === lastBlockId);
        lastBlock?.strokes.push(strokeData);
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
  const drawAllAtOnce = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화

    // ✅ 배경을 먼저 흰색으로 칠해줌
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 각 블록을 순회하며 그리기
    for (const block of blocks) {
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

  // JSON 추출 버튼 클릭 시
  const exportStepsJson = async () => {
    const result = {
      user_id: "example_user",
      problem_id: 1,
      answer: {
        file_name: "answer.jpg",
      },
      steps: blocks.map((block, i) => ({
        step_number: i + 1,
        step_time: block.strokes.reduce((acc, s) => acc + s.duration, 0),
        file_name: `step${String(i + 1).padStart(2, "0")}.jpg`,
      })),
      total_solve_time: strokes.reduce((acc, s) => acc + s.duration, 0),
      understand_time: 3000,
      solve_time: 5000,
      review_time: 2000,
    };
    console.log("📦 export json:", result);
  };

  // 채점(제출) 핸들러 - 이미지와 JSON 생성

  const handleSubmit = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const formData = new FormData();

    // 전체 이미지 저장 (answer.jpg)
    drawAllAtOnce(); // 먼저 전체 그리기
    // 캔버스에서 Blob 생성
    // Blob는 파일과 유사한 객체로, 바이너리 데이터를 다룰 수 있게 해줌
    // resolve는 비동기 작업이 완료되면 호출되는 함수
    const answerBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
    );
    formData.append("answer.jpg", answerBlob, "answer.jpg");

    // 디버깅용 - 미리 보기
    const previewUrl = URL.createObjectURL(answerBlob);
    window.open(previewUrl);

    // 각 step 이미지 저장
    const steps: any[] = [];
    for (let i = 0; i < blocks.length; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white"; // ← 추가
      ctx.fillRect(0, 0, canvas.width, canvas.height); // ← 추가
      const block = blocks[i];

      for (const stroke of block.strokes) {
        ctx.strokeStyle = stroke.duration > 2000 ? "red" : "black";
        ctx.lineWidth = stroke.duration > 2000 ? 3 : 1.5;

        ctx.beginPath();
        for (let j = 0; j < stroke.points.length; j++) {
          const p = stroke.points[j];
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      const stepBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
      );
      const stepFileName = `step${String(i + 1).padStart(2, "0")}.jpg`;
      formData.append(stepFileName, stepBlob, stepFileName);

      const stepTime = Math.round(
        block.strokes.reduce((acc, s) => acc + s.duration, 0) / 1000
      );

      // 미리 보기용 새 창 열기
      const stepUrl = URL.createObjectURL(stepBlob);
      window.open(stepUrl);

      steps.push({
        step_number: i + 1,
        step_time: stepTime,
        file_name: stepFileName,
      });
    }

    const sorted = [...strokes].sort((a, b) => a.timestamp - b.timestamp);
    const totalSolveTimeSec =
      sorted.length > 1
        ? Math.round((sorted.at(-1)!.timestamp - sorted[0].timestamp) / 1000)
        : 0;

    // JSON 부분 생성
    const jsonPayload = {
      user_id: "example_user_id",
      problem_id: "example_problem_id",
      answer: { file_name: "answer.jpg" },
      steps,
      total_solve_time: totalSolveTimeSec,
      understand_time: 3000,
      solve_time: 9000,
      review_time: 3000,
      files: [
        "answer.jpg",
        ...steps.map((s) => s.file_name), // step01.jpg, step02.jpg 등
      ],
    };

    formData.append("json", JSON.stringify(jsonPayload));

    // 디버깅용 로그
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
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
          onClick={() => {
            const canvas = canvasRef.current!;
            canvas
              .getContext("2d")!
              .clearRect(0, 0, canvas.width, canvas.height);
            setStrokes([]);
            setBlocks([]);
            setLastPoint(null);
            setLastStrokeTime(null);
            setActiveBlockId(null);
          }}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          전체 지우기
        </button>
        <button
          onClick={() => {
            const newStrokes = [...strokes];
            const removed = newStrokes.pop();
            setStrokes(newStrokes);

            const newBlocks = [...blocks];
            for (let i = newBlocks.length - 1; i >= 0; i--) {
              const strokesInBlock = newBlocks[i].strokes;
              if (
                strokesInBlock.some(
                  (s: any) => s.stroke_id === removed.stroke_id
                )
              ) {
                strokesInBlock.pop();
                if (strokesInBlock.length === 0) newBlocks.pop();
                break;
              }
            }
            setBlocks(newBlocks);

            const last = newStrokes.at(-1);
            if (last) {
              setLastPoint(last.end);
              setLastStrokeTime(last.timestamp);
            } else {
              setLastPoint(null);
              setLastStrokeTime(null);
            }

            drawAllAtOnce();
          }}
          className="px-3 py-1 bg-gray-100 border rounded"
        >
          한 획 지우기
        </button>
        <button
          onClick={exportStepsJson}
          className="px-3 py-1 bg-blue-100 border rounded"
        >
          JSON 만들기
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
        width={800}
        height={600}
        className="border border-gray-300 touch-none"
      />
    </div>
  );
};

export default SolutionArea;
