// PointerEvent의 화면 좌표를 캔버스 내부 좌표로 변환하는 함수
export const getRelativePointerPosition = (
  e: PointerEvent,
  canvas: HTMLCanvasElement
) => {
  const rect = canvas.getBoundingClientRect(); //canvas 요소의 위치와 크기 정보, 브라우저 창 기준에서의 canvas 위치와 크기
  const x = e.clientX - rect.left; // canvas 내부 좌표계 기준의 x좌표
  const y = e.clientY - rect.top; // canvas 내부 좌표계 기준의 y좌표
  return { x, y };
};

// 두 점 사이의 거리를 계산하는 함수
export const getProjectedPoint = (
  strokeStart: { x: number; y: number },
  strokeEnd: { x: number; y: number },
  pointerX: number,
  pointerY: number
) => {
  const dx = strokeEnd.x - strokeStart.x;
  const dy = strokeEnd.y - strokeStart.y;
  const len = Math.hypot(dx, dy); //선분의 길이 (피타고라스: √(dx² + dy²))
  if (len === 0) return null;

  const t =
    ((pointerX - strokeStart.x) * dx + (pointerY - strokeStart.y) * dy) /
    (len * len); // 선분 위의 점을 찾기 위한 비율(0이면 p1, 1이면 p2, 0~1 사이면 선분 위)
  if (t < 0 || t > 1) return null; // t가 0보다 작거나 1보다 크면 선분 바깥(null)임

  // 포인터와 선분 사이에서 가장 짧은 거리를 이루는 점의 좌표
  return {
    x: strokeStart.x + t * dx,
    y: strokeStart.y + t * dy,
  };
};

// 포인터가 stroke랑 가까운지(threshold보다 거리가 가까운지)확인하는 함수
export const isPointNearStroke = (
  strokeStart: { x: number; y: number },
  strokeEnd: { x: number; y: number },
  pointer: { x: number; y: number },
  threshold = 10
) => {
  const proj = getProjectedPoint(strokeStart, strokeEnd, pointer.x, pointer.y);
  if (!proj) return false;

  const dist = Math.hypot(pointer.x - proj.x, pointer.y - proj.y);
  return dist < threshold; // 지우기 반경(20px 이하)
};

export const removeStrokeFromBlocks = (blocks: any[], strokeId: number) => {
  return blocks
    .map((b) => ({
      ...b,
      strokes: b.strokes.filter(
        (s: { stroke_id: number }) => s.stroke_id !== strokeId
      ),
    }))
    .filter((b) => b.strokes.length > 0);
};

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
  lastStrokeTime: number | null
) => {
  const distance = lastPoint
    ? Math.hypot(first.x - lastPoint.x, first.y - lastPoint.y)
    : 0;
  const timeGap = lastStrokeTime ? first.time - lastStrokeTime : 0;
  const movedLeft = lastPoint && first.x < lastPoint.x - 30;
  const movedDown = lastPoint && first.y > lastPoint.y + 10;

  return distance > 100 || timeGap > 3000 || (movedLeft && movedDown);
};

export const updateBlocksWithStroke = ({
  stroke,
  blocks,
  lastPoint,
  lastStrokeTime,
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
      lastStrokeTime
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
