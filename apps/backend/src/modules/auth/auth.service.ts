import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginSso(code: string, state: string) {
    // Mock SSO validation for MVP
    // In production, validate with mitra.bgn.go.id
    const mockUser = await this.findOrCreateMockUser();
    return this.generateToken(mockUser);
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { sppg: true, supplier: true },
    });
  }

  private async findOrCreateMockUser() {
    // Mock data for MVP - replace with real SSO integration
    const email = 'admin@sppg-purwakarta.go.id';

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create SPPG first
      const sppg = await this.prisma.sppg.create({
        data: {
          name: 'SPPG Purwakarta',
          address: 'Jl. Nasional III, Purwakarta',
        },
      });

      user = await this.prisma.user.create({
        data: {
          email,
          name: 'Budi Santoso',
          role: Role.SPPG_ADMIN,
          sppgId: sppg.id,
        },
      });
    }

    return user;
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sppgId: user.sppgId,
        supplierId: user.supplierId,
      },
    };
  }
}
