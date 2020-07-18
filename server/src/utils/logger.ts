import winston from 'winston';
import { TransformFunction } from 'logform';
import TransportStream from 'winston-transport';
import { LoggingWinston } from '@google-cloud/logging-winston';

import { config } from '../config/config';


class TransportStreamManager {

    static readonly transports = (process.env.NODE_ENV === 'production')
        ? TransportStreamManager.createProductionTransports()
        : TransportStreamManager.createStandardTransports();

    private static createStandardTransports(): TransportStream | TransportStream[] {
        return [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                ),
            }),
        ];
    }

    private static createProductionTransports(): TransportStream | TransportStream[] {
        return [
            new LoggingWinston(),
        ];
    }

}

export const graphqlLogTransformer: TransformFunction = ({ info, jwtPayload, ...rest }) => {
    const path = info && `${info?.parentType?.name}.${info?.fieldName}`;
    const message = (path && `[${path}] ${rest.message}`) || rest.message;
    return { ...rest, message, userId: jwtPayload?.sub };
};


export const logger = winston.createLogger({
    level: config.logger.logLevel,
    format: winston.format.combine(
        winston.format(graphqlLogTransformer)(),
    ),
    transports: TransportStreamManager.transports,
});
