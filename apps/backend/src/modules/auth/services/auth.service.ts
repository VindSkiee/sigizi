import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../../database/prisma.service";
import { SsoLoginDto } from "../dto/sso-login.dto";
import { SsoCallbackDto } from "../dto/sso-callback.dto";
import { AuthResponse, Role } from "@sigizi/shared";

function stripNulls<T extends Record<string, any> | null>(obj: T): any {
  if (!obj) return undefined;
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = val === null ? undefined : val;
  }
  return result;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginSso(dto: SsoLoginDto): Promise<{ redirectUrl: string }> {
    const state = Buffer.from(JSON.stringify({ nonce: dto.code })).toString(
      "base64",
    );
    const redirectUrl = `https://mitra.bgn.go.id/sso/authorize?client_id=sigizi&state=${state}`;
    return { redirectUrl };
  }

  async handleSsoCallback(dto: SsoCallbackDto): Promise<AuthResponse> {
    const mockUser = await this.getOrCreateMockUser();

    const token = this.jwtService.sign({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });

    return {
      token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role as Role,
        sppgId: mockUser.sppgId ?? undefined,
        supplierId: mockUser.supplierId ?? undefined,
        sppg: stripNulls(mockUser.sppg),
        supplier: stripNulls(mockUser.supplier),
      },
    };
  }

  async validateToken(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { sppg: true, supplier: true },
    });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }

  private async getOrCreateMockUser() {
    let user = await this.prisma.user.findFirst({
      where: { role: "SPPG_ADMIN" },
      include: { sppg: true, supplier: true },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: "admin@sppg.go.id",
          name: "Admin SPPG",
          role: "SPPG_ADMIN",
        },
        include: { sppg: true, supplier: true },
      });
    }
    return user;
  }
}
