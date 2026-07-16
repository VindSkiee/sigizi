import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { hash, compare } from "bcrypt";
import { PrismaService } from "../../../database/prisma.service";
import { SsoLoginDto } from "../dto/sso-login.dto";
import { SsoCallbackDto } from "../dto/sso-callback.dto";
import { RegisterSupplierDto } from "../dto/register-supplier.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthResponse, Role } from "@sigizi/shared";

const BCRYPT_ROUNDS = 10;

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
    private readonly configService: ConfigService,
  ) {}

  async loginSso(dto: SsoLoginDto): Promise<{ redirectUrl: string }> {
    const state = Buffer.from(JSON.stringify({ nonce: dto.code })).toString(
      "base64",
    );

    if (process.env.NODE_ENV === "production") {
      const bgnUrl = this.configService.get(
        "SSO_BGN_AUTHORIZE_URL",
        "https://mitra.bgn.go.id/sso/authorize",
      );
      return { redirectUrl: `${bgnUrl}?client_id=sigizi&state=${state}` };
    }

    const portalUrl = this.configService.get(
      "NEXT_PUBLIC_PORTAL_URL",
      "http://localhost:3000",
    );
    return { redirectUrl: `${portalUrl}/auth/sso-redirect?state=${state}` };
  }

  async handleSsoCallback(dto: SsoCallbackDto): Promise<AuthResponse> {
    let user = await this.prisma.user.findFirst({
      where: { role: "SPPG_ADMIN" },
      include: { sppg: true, supplier: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Tidak ada admin SPPG di database. Jalankan seed terlebih dahulu.",
      );
    }

    return this.buildAuthResponse(user);
  }

  async getDevUsers(role: string): Promise<any[]> {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("Dev login hanya tersedia di development");
    }

    const validRole =
      role === "SPPG_ADMIN" || role === "SUPPLIER" ? role : "SPPG_ADMIN";

    return this.prisma.user.findMany({
      where: { role: validRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        sppg: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async devLogin(role: string, userId?: string): Promise<AuthResponse> {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("Dev login hanya tersedia di development");
    }

    const validRole =
      role === "SPPG_ADMIN" || role === "SUPPLIER" ? role : "SPPG_ADMIN";

    let user;
    if (userId) {
      user = await this.prisma.user.findFirst({
        where: { id: userId, role: validRole },
        include: { sppg: true, supplier: true },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: { role: validRole },
        include: { sppg: true, supplier: true },
      });
    }

    if (!user) {
      throw new UnauthorizedException(
        userId
          ? `User dengan role ${validRole} tidak ditemukan`
          : `Tidak ada user dengan role ${validRole} di database. Jalankan seed terlebih dahulu.`,
      );
    }

    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterSupplierDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("Email sudah terdaftar");
    }

    if (dto.isMarketSeller) {
      if (!dto.marketName?.trim()) {
        throw new BadRequestException("Nama pasar wajib diisi");
      }
      if (!dto.province || !dto.regency) {
        throw new BadRequestException(
          "Provinsi dan kabupaten/kota wajib diisi",
        );
      }
    } else {
      if (!dto.province || !dto.regency || !dto.district) {
        throw new BadRequestException(
          "Provinsi, kabupaten/kota, dan kecamatan wajib diisi",
        );
      }
    }

    const marketName = dto.isMarketSeller
      ? `Pasar ${dto.marketName!.trim().replace(/^Pasar\s+/i, "")}`
      : null;

    const hashedPassword = await hash(dto.password, BCRYPT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.create({
        data: {
          name: dto.name,
          nib: dto.nib,
          phone: dto.phone,
          address: dto.address,
          province: dto.province,
          regency: dto.regency,
          district: dto.district,
          village: dto.village,
          postalCode: dto.postalCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
          isMarketSeller: dto.isMarketSeller ?? false,
          marketName,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: "SUPPLIER",
          password: hashedPassword,
          supplierId: supplier.id,
        },
        include: { sppg: true, supplier: true },
      });

      return user;
    });

    return this.buildAuthResponse(result);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { sppg: true, supplier: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("Email atau password salah");
    }

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email atau password salah");
    }

    return this.buildAuthResponse(user);
  }

  async validateToken(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { sppg: true, supplier: true },
    });
    if (!user) {
      throw new UnauthorizedException("User tidak ditemukan");
    }
    return user;
  }

  private buildAuthResponse(user: any): AuthResponse {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        sppgId: user.sppgId ?? undefined,
        supplierId: user.supplierId ?? undefined,
        sppg: stripNulls(user.sppg),
        supplier: stripNulls(user.supplier),
      },
    };
  }
}
