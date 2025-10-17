import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateToolDto {
  @IsString()
  name: string;

  @IsString()
  dockerImageUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  requiredEnv?: string[];

  @IsOptional()
  @IsString()
  inputShape?: string;

  @IsOptional()
  @IsString()
  outputShape?: string;

  @IsOptional()
  usagePrice: number
}
