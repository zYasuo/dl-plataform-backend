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

    async sendWelcomeEmail(to: string, name: string, token: string): Promise<IResponseResend> {
        const response = await this.resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject: "Bem-vindo!",
            html: `
        <h1>Olá, ${name}!</h1>
        <p>Bem-vindo à nossa plataforma!</p>
        <p>Para verificar seu email, clique no link abaixo:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verificar Email</a>
      `
        });
        return {
            name: name,
            message: "Email de boas-vindas enviado com sucesso!"
        };
    }
}
