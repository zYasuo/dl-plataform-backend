import { Resend } from "resend";
import { Injectable } from "@nestjs/common";
import { IEmailService } from "./interface/email.interface";

@Injectable()
export class EmailService implements IEmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendWelcomeEmail(to: string, name: string): Promise<void> {
        await this.resend.emails.send({
            from: "noreply@yourdomain.com",
            to,
            subject: "Bem-vindo!",
            html: `
        <h1>Olá, ${name}!</h1>
        <p>Bem-vindo à nossa plataforma!</p>
      `
        });
    }
}
