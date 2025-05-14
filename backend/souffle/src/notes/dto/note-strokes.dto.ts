import { ApiProperty } from '@nestjs/swagger';

class StrokePointDto {
  @ApiProperty({ example: 12 })
  x: number;

  @ApiProperty({ example: 34 })
  y: number;
}

export class NoteStrokesResponseDto {
  solution_strokes: StrokePointDto[][];
  concept_strokes: StrokePointDto[][];
}
