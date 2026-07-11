import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BatchStatus } from "@sigizi/shared";

export class UpdateBatchStatusDto {
  @ApiProperty({ enum: BatchStatus, example: BatchStatus.FAILED })
  @IsEnum(BatchStatus)
  status!: BatchStatus;

  @ApiPropertyOptional({ example: "Kendaraan mengalami kecelakaan di jalan" })
  @ValidateIf((dto) => dto.status === BatchStatus.FAILED)
  @IsString()
  failedReason?: string;

  @ApiPropertyOptional({
    example: "https://storage.example.com/evidence/photo.jpg",
  })
  @ValidateIf((dto) => dto.status === BatchStatus.FAILED)
  @IsString()
  failedEvidence?: string;
}
