import { Controller, Post, Get, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ProductsService } from './products.service';
import { ImageProcessingService } from '../common/services/image-processing.service';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly imageProcessingService: ImageProcessingService
    ) { }

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

    /** Batch-update a category's settings (name, EN name, min quantity) across all its products */
    @Patch('rename-category')
    async updateCategory(@Body() body: { oldName: string; newName: string; newNameEn: string; minQty?: number }) {
        return this.productsService.updateCategory(body.oldName, { 
            newName: body.newName, 
            newNameEn: body.newNameEn, 
            minQty: body.minQty 
        });
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
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('No file uploaded');
        const url = await this.imageProcessingService.processAndSave(file, 'products');
        return { url };
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
