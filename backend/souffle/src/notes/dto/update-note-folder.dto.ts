import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNoteFolderDto {
  @ApiProperty({ example: '새 폴더 이름' })
  @IsString()
  name: string;
}

export class UpdateNoteFolderOrderDto {
  @ApiProperty({ example: 2, description: '변경할 sort_order 값' })
  @IsNumber()
  sort_order: number;
}
