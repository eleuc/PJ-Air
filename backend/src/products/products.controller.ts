import { Controller, Post, Get, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll() {
        return this.productsService.findAll();
    }

    @Get('category/:category')
    async findByCategory(@Param('category') category: string) {
        return this.productsService.findByCategory(category);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(parseInt(id));
    }

    @Post()
    async create(@Body() body: any) {
        return this.productsService.create(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.productsService.update(parseInt(id), body);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.productsService.delete(parseInt(id));
    }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'frontend', 'public', 'images', 'products');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = Array(24).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('No file uploaded');
        return { url: `/images/products/${file.filename}` };
    }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadProducts(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: any
    ) {
        const csvFile = files.find(f => f.originalname.endsWith('.csv'));
        if (csvFile) {
            await this.productsService.processCSV(csvFile);
        }
        return { message: 'Upload processed successfully' };
    }
}
