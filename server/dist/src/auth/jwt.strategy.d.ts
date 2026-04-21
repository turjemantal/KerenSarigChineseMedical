import { Strategy } from 'passport-jwt';
export interface JwtPayload {
    sub: string;
    phone: string;
    name?: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        clientId: string;
        phone: string;
        name: string;
    };
}
export {};
