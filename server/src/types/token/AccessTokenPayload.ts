/**
 * Shape of access JSON web token payload
 */
export interface AccessTokenPayload {

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
