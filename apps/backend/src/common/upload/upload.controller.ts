import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { randomBytes } from "crypto";
import { JwtAuthGuard } from "../../modules/auth/jwt-auth.guard";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function imageFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, accept: boolean) => void,
) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return callback(
      new BadRequestException("Only JPEG, PNG, and WebP images are allowed"),
      false,
    );
  }
  callback(null, true);
}

function storageFor(subdir: string) {
  return diskStorage({
    destination: join(__dirname, "..", "..", "..", "..", "uploads", subdir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString("hex")}`;
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  @Post("image")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: storageFor("items"),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_SIZE },
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload an image file" })
  @ApiConsumes("multipart/form-data")
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return { url: `/uploads/items/${file.filename}` };
  }

  @Post("profile")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: storageFor("profiles"),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_SIZE },
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload a profile image" })
  @ApiConsumes("multipart/form-data")
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return { url: `/uploads/profiles/${file.filename}` };
  }
}
