import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class RegisterNodeDto {
  @IsString()
  publicKey: string;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  minPricePerSec?: number;

  @IsOptional()
  @IsString()
  url?: string;
}