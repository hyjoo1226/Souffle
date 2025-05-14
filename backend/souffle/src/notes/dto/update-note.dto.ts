// dto/move-problem-folder.dto.ts
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveProblemFolderDto {
  @ApiProperty({
    example: 1,
    enum: [1, 2],
    description: '폴더 유형(1: 즐겨찾기, 2: 오답노트)',
  })
  @IsInt()
  @Min(1)
  type: number;

  @ApiProperty({ example: 5, description: '이동할 폴더 ID' })
  @IsInt()
  @Min(4)
  folderId: number;
}
