import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateNoteFolderDto {
  @IsString()
  name: string;

  @IsNumber()
  type: number;

  @IsOptional()
  @IsNumber()
  parent_id?: number;
}
