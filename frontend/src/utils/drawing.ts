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
