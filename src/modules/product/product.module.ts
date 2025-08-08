import { Module } from "@nestjs/common";
import { PrismaModule } from "../db/prisma.module";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";

@Module({
    imports: [PrismaModule],
    controllers: [ProductController],
    providers: [
        {
            provide: "IProductService",
            useClass: ProductService
        }
    ]
})
export class ProductModule {}
