import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNoteFolderDto {
  @ApiProperty({ example: '새 폴더 이름' })
  @IsString()
  name: string;
}
