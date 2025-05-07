import { drawBlocksOnCanvas } from "./drawing";

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
  return dist < threshold; // 지우기 반경(10px 이하)
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

/// 포인터에 가까운 stroke의 id를 찾는 함수
export function findStrokeNearPointer({
  x,
  y,
  blocks,
  strokes,
  useBlock = true,
}: {
  x: number;
  y: number;
  blocks: any[];
  strokes: any[];
  useBlock?: boolean;
}): number | null {
  const loopTarget = useBlock ? blocks ?? [] : [{ strokes }];
  for (const block of loopTarget) {
    for (const stroke of block.strokes) {
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const start = stroke.points[i];
        const end = stroke.points[i + 1];
        if (isPointNearStroke(start, end, { x, y })) {
          return stroke.stroke_id;
        }
      }
    }
  }
  return null;
}

export function eraseStrokeById({
  nearStrokeId,
  strokes,
  blocks,
  setStrokes,
  setBlocks,
  canvas,
  useBlock = true,
}: {
  nearStrokeId: number;
  strokes: any[];
  blocks: any[];
  setStrokes: (s: any[]) => void;
  setBlocks: (b: any[]) => void;
  canvas: HTMLCanvasElement;
  useBlock?: boolean;
}): { updatedStrokes: any[]; updatedBlocks: any[] } {
  const updatedStrokes = strokes.filter((s) => s.stroke_id !== nearStrokeId);
  setStrokes(updatedStrokes);

  if (useBlock) {
    const updatedBlocks = removeStrokeFromBlocks(blocks, nearStrokeId);
    setBlocks(updatedBlocks);
    drawBlocksOnCanvas(canvas, updatedBlocks);
    return { updatedStrokes, updatedBlocks };
  } else {
    drawBlocksOnCanvas(canvas, [{ strokes: updatedStrokes }]);
    return { updatedStrokes, updatedBlocks: [] };
  }
}

export function updateLastStrokeMetaAfterErase({
  updatedStrokes,
  blocks,
  setLastPoint,
  setLastStrokeTime,
  setLastBlockId,
  useBlock = true,
}: {
  updatedStrokes: any[];
  blocks: any[];
  setLastPoint: (p: { x: number; y: number } | null) => void;
  setLastStrokeTime: (t: number | null) => void;
  setLastBlockId: (id: number | null) => void;
  useBlock?: boolean;
}) {
  const last = updatedStrokes.at(-1);
  if (!last) {
    setLastPoint(null);
    setLastStrokeTime(null);
    setLastBlockId(null);
    return;
  }

  setLastPoint(last.end ?? null);
  setLastStrokeTime(last.timestamp ?? null);

  if (useBlock) {
    const block = blocks.find((b) =>
      b.strokes.some(
        (s: { stroke_id: number }) => s.stroke_id === last.stroke_id
      )
    );
    setLastBlockId(block?.block_id ?? null);
  } else {
    setLastBlockId(null);
  }
}

// 마지막 한 획 지우는 함수
export function eraseLastStroke({
  strokes,
  blocks,
  setStrokes,
  setBlocks,
  setLastPoint,
  setLastStrokeTime,
  setLastBlockId,
  canvas,
}: {
  strokes: any[];
  blocks: any[];
  setStrokes: (s: any[]) => void;
  setBlocks: (b: any[]) => void;
  setLastPoint: (p: any) => void;
  setLastStrokeTime: (t: any) => void;
  setLastBlockId: (id: number | null) => void;
  canvas: HTMLCanvasElement;
}) {
  const last = strokes.at(-1);
  if (!last) return;

  const updatedStrokes = strokes.filter((s) => s.stroke_id !== last.stroke_id);
  const updatedBlocks = removeStrokeFromBlocks(blocks, last.stroke_id);

  setStrokes(updatedStrokes);
  setBlocks(updatedBlocks);
  drawBlocksOnCanvas(canvas, updatedBlocks);

  const newLast = updatedStrokes.at(-1);
  setLastPoint(newLast?.end ?? null);
  setLastStrokeTime(newLast?.timestamp ?? null);

  const containingBlock = updatedBlocks.find((b) =>
    b.strokes.some((s: any) => s.stroke_id === newLast?.stroke_id)
  );
  setLastBlockId(containingBlock?.block_id ?? null);
}

export function eraseAll({
  canvas,
  setStrokes,
  setBlocks,
  setLastPoint,
  setLastStrokeTime,
  setLastBlockId,
}: {
  canvas: HTMLCanvasElement;
  setStrokes: (s: any[]) => void;
  setBlocks: (b: any[]) => void;
  setLastPoint: (p: any) => void;
  setLastStrokeTime: (t: any) => void;
  setLastBlockId: (id: number | null) => void;
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setStrokes([]);
  setBlocks([]);
  setLastPoint(null);
  setLastStrokeTime(null);
  setLastBlockId(null);
}
