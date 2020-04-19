import dotenv from 'dotenv';


process.env.NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config();

export const config = {

    /**
     * Server port
     */
    port: parseInt(process.env.PORT || '5000'),

    /**
     * Winston logger log level
     */
    logLevel: process.env.LOG_LEVEL || 'silly',

} as const;
