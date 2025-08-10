import type { IProductService } from "./product.service";
import { Controller, Get, Inject, UseGuards } from "@nestjs/common";

@Controller("product")
export class ProductController {
    constructor(@Inject("IProductService") private productService: IProductService) {}

    @Get()
    async listProducts() {
        return this.productService.listProducts();
    }

    @Get("category")
    async listCategory() {
        return this.productService.listCategory();
    }
}
