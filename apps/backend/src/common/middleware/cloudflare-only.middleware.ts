import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

// Source: https://www.cloudflare.com/ips-v4
const CLOUDFLARE_IPV4 = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
];

// Source: https://www.cloudflare.com/ips-v6
const CLOUDFLARE_IPV6 = [
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

const ALL_CF_RANGES = [...CLOUDFLARE_IPV4, ...CLOUDFLARE_IPV6];

/**
 * Cek apakah IP berada dalam CIDR range
 * Bitwise check untuk IPv4, prefix match untuk IPv6.
 */
function ipInCIDR(ip: string, cidr: string): boolean {
  try {
    const [range, bitsStr] = cidr.split("/");
    const bits = parseInt(bitsStr, 10);

    // IPv6 — simple prefix match
    if (ip.includes(":")) {
      return ip.startsWith(range.split(":")[0]);
    }

    // IPv4 — bitwise check
    const mask = ~(2 ** (32 - bits) - 1);
    const ipNum = ip
      .split(".")
      .reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);
    const rangeNum = range
      .split(".")
      .reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);

    return (ipNum & mask) === (rangeNum & mask);
  } catch {
    return false;
  }
}

@Injectable()
export class CloudflareOnlyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // BYPASS: Development mode
    if (process.env.NODE_ENV !== "production") {
      return next();
    }

    // BYPASS: Health check endpoint (biar monitoring tools bisa akses)
    if (req.path === "/api/health") {
      return next();
    }

    // METHOD 1: Cek header CF-Connecting-IP — ini yg PALING RELIABLE
    const cfHeader = req.headers["cf-connecting-ip"] as string | undefined;
    if (cfHeader) {
      return next();
    }

    // METHOD 2: Fallback — cek IP address langsung
    const clientIp = req.ip;
    if (clientIp) {
      const cleanIp = clientIp.replace(/^::ffff:/, "");
      const isCF = ALL_CF_RANGES.some((cidr) => ipInCIDR(cleanIp, cidr));
      if (isCF) {
        return next();
      }
    }

    // BLOKIR — akses langsung tanpa Cloudflare
    console.warn(
      `[CLOUDFLARE BLOCK] Direct access detected from IP: ${req.ip || "unknown"} | Path: ${req.path}`,
    );

    throw new ForbiddenException(
      "Direct access not allowed. Please use Cloudflare proxy.",
    );
  }
}
