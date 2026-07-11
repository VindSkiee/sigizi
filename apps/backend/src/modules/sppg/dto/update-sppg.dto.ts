import { PartialType } from "@nestjs/swagger";
import { CreateSppgDto } from "./create-sppg.dto";

export class UpdateSppgDto extends PartialType(CreateSppgDto) {}
