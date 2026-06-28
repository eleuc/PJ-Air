import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Category } from './category.entity';

@Controller('products/categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findAllCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findCategoryById(parseInt(id));
  }

  @Post()
  async create(@Body() body: Partial<Category>) {
    return this.productsService.createCategory(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Category>) {
    return this.productsService.updateCategoryById(parseInt(id), body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.deleteCategory(parseInt(id));
  }
}
