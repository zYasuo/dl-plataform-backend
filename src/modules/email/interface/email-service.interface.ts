import { IResponseResend } from "./email-response.interface";

export interface IEmailService {
  sendWelcomeEmail(to: string, name: string): Promise<IResponseResend>;
}