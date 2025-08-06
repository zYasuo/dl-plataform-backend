import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
@Module({
    providers: [
        {
            provide: "IEmailService",
            useClass: EmailService
        }
    ],
    exports: ["IEmailService"]
})
export class EmailModule {}
