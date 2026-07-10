import { PartialType } from "@nestjs/swagger";
import { CreateMouDto } from "./create-mou.dto";

export class UpdateMouDto extends PartialType(CreateMouDto) {}
