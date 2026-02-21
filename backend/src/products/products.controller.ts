import { Controller, Post, UseInterceptors, UploadedFiles, Body } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadProducts(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: any
    ) {
        const csvFile = files.find(f => f.originalname.endsWith('.csv'));
        const zipFile = files.find(f => f.originalname.endsWith('.zip'));

        if (csvFile) {
            await this.productsService.processCSV(csvFile);
        }

        if (zipFile) {
            await this.productsService.processZIP(zipFile);
        }

        return { message: 'Upload processed successfully' };
    }
}
