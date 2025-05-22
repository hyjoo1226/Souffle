import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToFolderDto {
  @ApiProperty({ example: 123, description: '문제 번호' })
  @IsInt()
  @Min(1)
  problemId: number;

  @ApiProperty({ example: 5, description: '오답노트 폴더 ID' })
  @IsInt()
  @Min(4)
  folderId: number;

  @ApiProperty({
    example: 1,
    enum: [1, 2],
    description: '1: 즐겨찾기, 2: 오답노트',
  })
  type: number;
}
