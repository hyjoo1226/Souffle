import { isPointNearStroke, removeStrokeFromBlocks } from "../utils/drawing";

export const eraseStrokeNearPointer = ({
  x,
  y,
  blocks,
  strokes,
  setBlocks,
  setStrokes,
  setLastPoint,
  setLastStrokeTime,
  setLastBlockId,
  drawAllAtOnce,
  useBlock = true,
}: {
  x: number;
  y: number;
  blocks: Array<{
    block_id: number;
    strokes: Array<{
      points: Array<{ x: number; y: number }>;
      stroke_id: number;
    }>;
  }>;
  strokes: Array<{
    stroke_id: number;
    points: Array<{ x: number; y: number }>;
    end: { x: number; y: number };
    timestamp: number;
  }>;
  setBlocks: (blocks: any[]) => void;
  setStrokes: (strokes: any[]) => void;
  setLastPoint: (point: { x: number; y: number } | null) => void;
  setLastStrokeTime: (time: number | null) => void;
  setLastBlockId: (id: number | null) => void;
  drawAllAtOnce: (blocks: any[]) => void;
  useBlock?: boolean;
}) => {
  const loopTarget = useBlock ? blocks ?? [] : [{ strokes }];
  for (const block of loopTarget) {
    for (const stroke of block.strokes) {
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const start = stroke.points[i]; // 선분(stroke)의 시작점
        const end = stroke.points[i + 1]; // 선분(stroke)의 끝점
        if (isPointNearStroke(start, end, { x, y })) {
          const updatedStrokes = strokes.filter(
            (s) => s.stroke_id !== stroke.stroke_id
          );

          setStrokes(updatedStrokes);
          if (useBlock && setBlocks && blocks) {
            const updatedBlocks = removeStrokeFromBlocks(
              blocks,
              stroke.stroke_id
            );
            setBlocks(updatedBlocks);
            drawAllAtOnce(updatedBlocks); // 꼭 local로 전달
          } else {
            drawAllAtOnce(updatedStrokes); // 답안용
          }

          const last = updatedStrokes.at(-1); // 다음 stroke의 기준점을 위한 변수
          if (last) {
            setLastPoint(last?.end ?? null);
            setLastStrokeTime(last?.timestamp ?? null);

            if (useBlock && setLastBlockId && blocks) {
              const containingBlock = blocks.find((b) =>
                b.strokes.some((s) => s.stroke_id === last?.stroke_id)
              );
              setLastBlockId(containingBlock?.block_id ?? null);
            } else {
              setLastBlockId(null);
            }

            return true; // 지움
          }
        }
      }
    }
  }

  return false; // 아무 것도 안 지움
};
