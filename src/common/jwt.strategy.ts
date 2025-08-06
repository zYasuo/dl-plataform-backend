import { ICreateJWT } from "../modules/auth/interface/jwt-payload.interface";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY || "secret_key"
        });
    }

    async validate(payload: ICreateJWT) {
        if (!payload) {
            throw new UnauthorizedException();
        }

        return {
            email: payload.email,
            name: payload.name
        };
    }
}
