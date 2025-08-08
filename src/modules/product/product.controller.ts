import type { IProductService } from "./product.service";
import { Controller, Get, Inject } from "@nestjs/common";

@Controller("product")
export class ProductController {
    constructor(@Inject("IProductService") private productService: IProductService) {}

    @Get()
    async listProducts() {
        return this.productService.listProducts();
    }
}
