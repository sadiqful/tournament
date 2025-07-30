import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly options: {
      maxSize?: number;
      allowedMimeTypes?: string[];
    } = {},
  ) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      return file;
    }

    // Check file size
    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum allowed size is ${this.options.maxSize} bytes`,
      );
    }

    // Check mime type
    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}