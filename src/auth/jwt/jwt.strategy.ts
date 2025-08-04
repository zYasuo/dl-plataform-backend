import { Injectable } from "@nestjs/common";
import { ICreateJWT } from "./dto/jwt-payload.interface";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: "key"
        });
    }

    async validate(payload: ICreateJWT) {
        return { payload };
    }
}
