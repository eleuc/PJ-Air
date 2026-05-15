import { Controller, Post, Get, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ProductsService } from './products.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async create(@Body() body: any) {
        return this.productsService.create(body);
    }

    /** Batch-update a category's settings (name, EN name, min quantity) across all its products */
    @Patch('rename-category')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async updateCategory(@Body() body: { oldName: string; newName: string; newNameEn: string; minQty?: number }) {
        return this.productsService.updateCategory(body.oldName, { 
            newName: body.newName, 
            newNameEn: body.newNameEn, 
            minQty: body.minQty 
        });
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.productsService.update(parseInt(id), body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async delete(@Param('id') id: string) {
        return this.productsService.delete(parseInt(id));
    }

    @Post('upload-image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                // process.cwd() is [root]/backend
                const uploadPath = join(process.cwd(), 'uploads', 'products');
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
        return { url: `/uploads/products/${file.filename}` };
    }

    @Post('upload')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
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
