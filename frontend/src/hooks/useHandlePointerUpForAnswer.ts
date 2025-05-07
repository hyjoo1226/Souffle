// hooks/useHandlePointerUpForAnswer.ts
import { createStroke } from "@/utils/drawing";

export const useHandlePointerUpForAnswer = () => {
  return ({
    currentStrokeRef,
    strokes,
    lastStrokeEndTime,
    setStrokes,
    setDrawing,
  }: {
    currentStrokeRef: React.MutableRefObject<any[]>;
    strokes: any[];
    lastStrokeEndTime: React.MutableRefObject<number | null>;
    setStrokes: (s: any[]) => void;
    setDrawing: (d: boolean) => void;
  }) => {
    setDrawing(false);
    if (currentStrokeRef.current.length <= 1) return;

    const now = Date.now();
    const stroke = createStroke(
      currentStrokeRef.current,
      strokes.length + 1,
      now
    );
    lastStrokeEndTime.current = now;
    setStrokes([...strokes, stroke]);

    currentStrokeRef.current = [];
  };
};
