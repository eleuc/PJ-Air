import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { extname, join } from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  async processAndSave(
    file: Express.Multer.File,
    subfolder: 'products' | 'avatars',
    width: number = 800,
    height: number = 800,
  ): Promise<string> {
    const uploadPath = join(__dirname, '..', '..', '..', 'frontend', 'public', 'images', subfolder);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const randomName = Array(24)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    
    const filename = `${randomName}.webp`;
    const fullPath = join(uploadPath, filename);

    try {
      await sharp(file.buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat('webp', { quality: 80 })
        .toFile(fullPath);

      return `/images/${subfolder}/${filename}`;
    } catch (error) {
      this.logger.error(`Error processing image: ${error.message}`);
      throw new Error('Could not process image');
    }
  }
}
