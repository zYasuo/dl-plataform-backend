import { Module } from "@nestjs/common";
import { AuthModule } from "../../modules/auth/auth.module";
import { UserModule } from "../../modules/user/user.module";
import { ProductModule } from "src/modules/product/product.module";

@Module({
    imports: [AuthModule, UserModule, ProductModule]
})
export class V1Module {}
