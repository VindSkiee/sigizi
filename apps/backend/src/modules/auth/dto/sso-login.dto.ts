import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SsoLoginDto {
  @ApiProperty({ description: "SSO authorization code" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: "SSO state parameter" })
  @IsString()
  @IsNotEmpty()
  state: string;
}
