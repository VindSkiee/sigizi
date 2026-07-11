import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { SsoLoginDto } from "../dto/sso-login.dto";
import { SsoCallbackDto } from "../dto/sso-callback.dto";
import { JwtAuthGuard } from "../jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sso")
  @ApiOperation({ summary: "Initiate SSO login" })
  async loginSso(@Body() dto: SsoLoginDto) {
    return this.authService.loginSso(dto);
  }

  @Get("callback")
  @ApiOperation({ summary: "SSO callback" })
  async callback(@Query() dto: SsoCallbackDto) {
    return this.authService.handleSsoCallback(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user" })
  async getMe(@Request() req: any) {
    return req.user;
  }
}
