import { TransformFunction } from 'logform';
import { createLogger, format, transports } from 'winston';

import { config } from '../config/config';


export const graphqlLogTransformer: TransformFunction = ({ info, jwtPayload, ...rest }) => ({
    ...rest,
    path: info && `${info?.parentType?.name}.${info?.fieldName}`,
    userId: jwtPayload?.userId,
});

const loggerFormat = (process.env.NODE_ENV === 'production')
    ? format.combine(format.json())
    : format.combine(format.colorize(), format.simple());

export const logger = createLogger({
    level: config.logger.logLevel,
    format: format.combine(
        format(graphqlLogTransformer)(),
    ),
    transports: [
        new transports.Console({
            format: loggerFormat,
        }),
    ],
});
