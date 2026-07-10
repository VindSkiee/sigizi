import { Module } from "@nestjs/common";
import { MouService } from "./services/mou.service";
import { MouController } from "./controllers/mou.controller";

@Module({
  controllers: [MouController],
  providers: [MouService],
  exports: [MouService],
})
export class MouModule {}
