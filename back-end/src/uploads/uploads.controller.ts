import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get(':filename')
  getUploadedFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.uploadsService.getFileStream(filename, res);
  }
}
