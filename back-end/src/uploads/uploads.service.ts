import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Injectable()
export class UploadsService {
  getFileStream(filename: string, res: Response) {
    const filePath = join(__dirname, '..', '..', 'uploads', filename);
    console.log('📂 Fichier demandé:', filePath);

    if (!existsSync(filePath)) {
      throw new BadRequestException('Fichier introuvable');
    }

    return createReadStream(filePath).pipe(res);
  }
}
