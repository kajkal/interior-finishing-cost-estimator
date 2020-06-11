/**
 * Shape of password reset JSON web token payload
 */
export interface PasswordResetTokenPayload {

    /**
     * User id
     */
    sub: string;

    /**
     * issued at - as timestamp in sec
     */
    iat: number;

    /**
     * expiration time - as timestamp in sec
     */
    exp: number;

}
