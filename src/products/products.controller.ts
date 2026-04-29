import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './providers/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    const data = await this.productsService.create(createProductDto);
    return {
      code: 201,
      status: 'success',
      message: 'Product created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.productsService.findAll();
    return {
      code: 200,
      status: 'success',
      message: 'Products retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productsService.findOne(id);
    return {
      code: 200,
      status: 'success',
      message: 'Product retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    const data = await this.productsService.update(id, updateProductDto);
    return {
      code: 200,
      status: 'success',
      message: 'Product updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(id);
    return {
      code: 200,
      status: 'success',
      message: 'Product deleted successfully',
      data: null,
    };
  }
}
