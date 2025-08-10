import { Inject } from "@nestjs/common";
import { PrismaClient, product, category } from "@prisma/client";

export interface IProductService {
    listProducts(): Promise<product[]>;
    listCategory(): Promise<category[]>;
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

    async listCategory(): Promise<category[]> {
        return this.prismaDB.category.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
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
                }
            }
        });
    }
}
