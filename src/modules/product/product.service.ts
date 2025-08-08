import { Inject } from "@nestjs/common";
import { PrismaClient, product } from "@prisma/client";

export interface IProductService {
    listProducts(): Promise<product[]>;
}

export class ProductService implements IProductService {
    constructor(@Inject("PRISMA_CLIENT") private prismaDB: PrismaClient) {}

    async listProducts(): Promise<product[]> {
        return this.prismaDB.product.findMany({
            where: {
                product_variant: {
                    some: {}
                }
            },
            include: {
                category: true,
                product_variant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true,
                        price_in_cents: true,
                        image_url: true
                    }
                }
            }
        });
    }
}
