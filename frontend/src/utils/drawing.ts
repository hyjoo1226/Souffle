export interface PointerUpHandlerContext {
  eraseMode: boolean;
  currentStrokeRef: React.MutableRefObject<any[]>;
  strokes: any[];
  blocks: any[];
  lastPoint: any;
  lastStrokeTime: number | null;
  lastBlockId: number | null;
  lastStrokeEndTime: React.MutableRefObject<number | null>;
  blockSnapshotsRef: React.MutableRefObject<any[][]>;
  setStrokes: (strokes: any[]) => void;
  setBlocks: (blocks: any[]) => void;
  setLastPoint: (point: any) => void;
  setLastStrokeTime: (time: number | null) => void;
  setLastBlockId: (id: number | null) => void;
  setCurrentStroke: (points: any[]) => void;
  setDrawing: (drawing: boolean) => void;
}

// 캔버스에 블록을 그리는 함수
export function drawBlocksOnCanvas(canvas: HTMLCanvasElement, blocks: any[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
}

// stroke를 생성하는 함수
export const createStroke = (
  points: { x: number; y: number; time: number }[],
  strokeId: number,
  timestamp: number
) => {
  const first = points[0];
  const last = points.at(-1)!;
  return {
    stroke_id: strokeId,
    timestamp, //이 획이 기록된 시점의 시간 (밀리초)
    points: [...points], // 사용자가 드래그한 경로의 좌표 배열
    duration: last ? last.time - first.time : 0, //획을 그리는 데 걸린 시간
    start: first, //획의 시작점 좌표
    end: last, //획의 끝점 좌표
  };
};

export const shouldCreateNewBlock = (
  first: { x: number; y: number; time: number },
  lastPoint: { x: number; y: number } | null,
<<<<<<< HEAD
  lastStrokeTime: number | null
=======
  // lastStrokeTime: number | null
>>>>>>> fe-feature/222-googleOauth
) => {
  const distance = lastPoint
    ? Math.hypot(first.x - lastPoint.x, first.y - lastPoint.y)
    : 0;
<<<<<<< HEAD
  const timeGap = lastStrokeTime ? first.time - lastStrokeTime : 0;
  const movedLeft = lastPoint && first.x + 70 < lastPoint.x;
  const movedDown = lastPoint && first.y > lastPoint.y + 10;

  return distance > 100 || timeGap > 3000 || (movedLeft && movedDown);
=======
  // const timeGap = lastStrokeTime ? first.time - lastStrokeTime : 0;
  const movedLeft = lastPoint && first.x + 70 < lastPoint.x;
  const movedDown = lastPoint && first.y > lastPoint.y + 10;

  return distance > 100 || (movedLeft && movedDown);
>>>>>>> fe-feature/222-googleOauth
};

export const updateBlocksWithStroke = ({
  stroke,
  blocks,
  lastPoint,
<<<<<<< HEAD
  lastStrokeTime,
=======
  // lastStrokeTime,
>>>>>>> fe-feature/222-googleOauth
  lastBlockId,
}: {
  stroke: {
    stroke_id: number;
    timestamp: number;
    points: { x: number; y: number; time: number }[];
    duration: number;
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  blocks: { block_id: number; strokes: (typeof stroke)[] }[];
  lastPoint: { x: number; y: number } | null;
  lastStrokeTime: number | null;
  lastBlockId: number | null;
}) => {
  const newBlocks = [...blocks];

  const needNewBlock =
    blocks.length === 0 ||
    shouldCreateNewBlock(
      { ...stroke.start, time: stroke.timestamp },
      lastPoint,
<<<<<<< HEAD
      lastStrokeTime
=======
      // lastStrokeTime
>>>>>>> fe-feature/222-googleOauth
    ) ||
    !newBlocks.find((b) => b.block_id === lastBlockId);

  if (needNewBlock) {
    const newBlockId = newBlocks.length + 1;
    newBlocks.push({
      block_id: newBlockId,
      strokes: [stroke],
    });
  } else {
    const lastBlock = newBlocks.find((b) => b.block_id === lastBlockId);
    lastBlock?.strokes.push(stroke);
  }

  return newBlocks;
};

export const updateLastStrokeMeta = ({
  lastStroke,
  blocks,
  setLastPoint,
  setLastStrokeTime,
  setLastBlockId,
}: {
  lastStroke: {
    end: { x: number; y: number };
    timestamp: number;
    stroke_id: number;
  };
  blocks: { block_id: number; strokes: { stroke_id: number }[] }[];
  setLastPoint: (point: { x: number; y: number }) => void;
  setLastStrokeTime: (time: number) => void;
  setLastBlockId: (blockId: number | null) => void;
}) => {
  setLastPoint(lastStroke.end);
  setLastStrokeTime(lastStroke.timestamp);

  const containingBlock = blocks.find((b) =>
    b.strokes.some((s) => s.stroke_id === lastStroke.stroke_id)
  );
  setLastBlockId(containingBlock?.block_id ?? null);
};

export function getPointerUpHandler(
  ctx: PointerUpHandlerContext & {
    blockSnapshotsRef: React.MutableRefObject<any[][]>;
    lastSavedBlocksRef: React.MutableRefObject<any[][]>;
  }
) {
  return (_e: PointerEvent) => {
    const {
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
    } = ctx;

    if (eraseMode) return;
    setDrawing(false);
    if (currentStrokeRef.current.length <= 1) return;

    const now = Date.now();
    const stroke = createStroke(
      currentStrokeRef.current,
      strokes.length + 1,
      now
    );
    lastStrokeEndTime.current = now;

    const newStrokes = [...strokes, stroke];
    setStrokes(newStrokes);

    const needNewBlock =
      blocks.length === 0 ||
      shouldCreateNewBlock(
        { ...stroke.start, time: stroke.timestamp },
        lastPoint,
<<<<<<< HEAD
        lastStrokeTime
=======
        // lastStrokeTime
>>>>>>> fe-feature/222-googleOauth
      ) ||
      !blocks.find((b) => b.block_id === lastBlockId);

    if (needNewBlock) {
      // ✅ 이전까지의 blocks만 snapshot으로 저장
      const snapshot = JSON.parse(JSON.stringify(lastSavedBlocksRef.current));
      blockSnapshotsRef.current.push(snapshot);
    }
    const newBlocks = updateBlocksWithStroke({
      stroke,
      blocks,
      lastPoint,
      lastStrokeTime,
      lastBlockId,
    });
    setBlocks(newBlocks);

    updateLastStrokeMeta({
      lastStroke: stroke,
      blocks: newBlocks,
      setLastPoint,
      setLastStrokeTime,
      setLastBlockId,
    });

    setCurrentStroke([]);
  };
}

export async function generateAnswerImage(
  canvas: HTMLCanvasElement,
  blocks: any[]
) {
  drawBlocksOnCanvas(canvas, blocks);
  const answerBlob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
  );
  window.open(URL.createObjectURL(answerBlob));
  return answerBlob;
}

export async function generateStepImages(
  snapshots: { block_id: number; strokes: any[] }[][],
  canvas: HTMLCanvasElement,
  blocks: { block_id: number; strokes: any[] }[] // ✅ block 단위 시간 정보 전달
) {
  const ctx = canvas.getContext("2d")!;
  const steps: any[] = [];

  for (let i = 1; i < snapshots.length; i++) {
    const snapshot = snapshots[i];
    const prevBlock = blocks[i - 1];
    const currBlock = blocks[i];
    const prevStroke = prevBlock?.strokes.at(-1);
    // const currStroke = currBlock?.strokes[0];

    const prevEnd = (prevStroke?.timestamp ?? 0) + (prevStroke?.duration ?? 0);
    const currEnd =
      (currBlock?.strokes.at(-1)?.timestamp ?? 0) +
      (currBlock?.strokes.at(-1)?.duration ?? 0);

    //  사용자가 이전 블록을 마치고 다음 블록을 끝낼 때까지 걸린 시간
    const blockGapTime = Math.max(0, Math.round((currEnd - prevEnd) / 1000));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const block of snapshot) {
      for (const stroke of block.strokes) {
        ctx.beginPath();
        stroke.points.forEach((p: any, j: number) =>
          j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        );
        ctx.stroke();
      }
    }

    const stepBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
    );

    const stepNumber = i; // step1부터 시작
    const stepFileName = `step${String(stepNumber).padStart(2, "0")}.jpg`;
    console.log("개수보자", snapshot.length);

    window.open(URL.createObjectURL(stepBlob));

    steps.push({
      step_number: stepNumber,
      step_time: blockGapTime,
      file_name: stepFileName,
      blob: stepBlob,
    });
  }

  return steps;
}

export async function generateFullStepImage(
  canvas: HTMLCanvasElement,
  blocks: any[]
) {
  drawBlocksOnCanvas(canvas, blocks);

  const fullStepBlob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
  );
  window.open(URL.createObjectURL(fullStepBlob));

  return {
    file_name: "full_step.jpg",
    blob: fullStepBlob,
  };
}
