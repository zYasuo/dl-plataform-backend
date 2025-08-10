import { Resend } from "resend";
import { Injectable } from "@nestjs/common";
import { IEmailService } from "./interface/email-service.interface";
import { IResponseResend } from "./interface/email-response.interface";

@Injectable()
export class EmailService implements IEmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    private getWelcomeEmailTemplate(name: string, token: string): string {
        return `
            <h1>Welcome, ${name}!</h1>
            <p>Welcome to DL Platform!</p>
            <p>To verify your email, click the link below:</p>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>
        `;
    }

    async sendWelcomeEmail(to: string, name: string, token: string): Promise<IResponseResend> {
        await this.resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject: "Welcome to DL Platform!",
            html: this.getWelcomeEmailTemplate(name, token)
        });
        return {
            name: name,
            message: "Welcome email sent successfully!"
        };
    }
}
