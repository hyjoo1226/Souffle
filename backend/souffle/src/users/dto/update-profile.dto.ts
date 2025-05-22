import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: '변경할 닉네임', description: '새 닉네임' })
  @IsString()
  nickname: string;
}
