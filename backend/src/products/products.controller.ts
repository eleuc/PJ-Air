import { Controller, Post, Get, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
