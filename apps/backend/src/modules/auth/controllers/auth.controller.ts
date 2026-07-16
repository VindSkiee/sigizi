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
import { RegisterSupplierDto } from "../dto/register-supplier.dto";
import { LoginDto } from "../dto/login.dto";
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

  @Post("register")
  @ApiOperation({ summary: "Register supplier account" })
  async register(@Body() dto: RegisterSupplierDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login with email & password" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user" })
  async getMe(@Request() req: any) {
    return req.user;
  }

  @Get("dev-users")
  @ApiOperation({
    summary: "Get list of users for dev login (development only)",
  })
  async getDevUsers(@Query("role") role?: string) {
    return this.authService.getDevUsers(role || "SPPG_ADMIN");
  }

  @Get("dev-login")
  @ApiOperation({ summary: "Dev-only quick login (development only)" })
  async devLogin(
    @Query("role") role?: string,
    @Query("userId") userId?: string,
  ) {
    return this.authService.devLogin(role || "SPPG_ADMIN", userId);
  }
}
