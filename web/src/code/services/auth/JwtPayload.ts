export interface JwtPayload {
    sub: string; // user id
    iat: number; // issued at - as timestamp in sec
    exp: number; // expiration time - as timestamp in sec
}
