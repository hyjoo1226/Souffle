import {
  createStroke,
  updateBlocksWithStroke,
  updateLastStrokeMeta,
} from "../utils/drawing";

export const useHandlePointerUp = () => {
  return ({
    eraseMode,
    currentStrokeRef,
    strokes,
    blocks,
    lastPoint,
    lastStrokeTime,
    lastBlockId,
    setStrokes,
    setBlocks,
    setLastPoint,
    setLastStrokeTime,
    setLastBlockId,
    setCurrentStroke,
    setDrawing,
  }: {
    eraseMode: boolean;
    currentStrokeRef: React.MutableRefObject<any[]>;
    strokes: any[];
    blocks: any;
    lastPoint: any;
    lastStrokeTime: number | null;
    lastBlockId: number | null;
    setStrokes: (strokes: any[]) => void;
    setBlocks: (blocks: any[]) => void;
    setLastPoint: (point: any) => void;
    setLastStrokeTime: (time: number | null) => void;
    setLastBlockId: (id: number | null) => void;
    setCurrentStroke: (points: any[]) => void;
    setDrawing: (drawing: boolean) => void;
  }) => {
    if (eraseMode) return;
    setDrawing(false);
    if (currentStrokeRef.current.length <= 1) return;

    const now = Date.now();
    const stroke = createStroke(
      currentStrokeRef.current,
      strokes.length + 1,
      now
    );

    const newStrokes = [...strokes, stroke];
    setStrokes(newStrokes);

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
};
