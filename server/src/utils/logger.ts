import { DateTime } from 'luxon';
import { createLogger, format, transports } from 'winston';
import {TransformFunction} from 'logform';

import { config } from '../config/config';


export const graphqlLogTransformer: TransformFunction = ({info, jwtPayload, ...rest}) => ({
    ...rest,
    path: `${info?.parentType?.name}.${info?.fieldName}`,
    userId: jwtPayload?.userId,
});

/**
 * Logs GraphQL related actions.
 */
export const graphQLLogger = createLogger({
    level: 'info',
    format: format.combine(
        format(graphqlLogTransformer)(),
        format.timestamp(),
        format.json(),
    ),
    transports: [
        new transports.File({
            filename: createLogFilePath(config.logger.graphqlLogFilename),
        }),
    ],
});

/**
 * Logs server related actions.
 */
export const logger = createLogger({
    level: config.logger.logLevel,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    transports: [
        new transports.File({
            filename: createLogFilePath(config.logger.serverLogFilename),
        }),
        new transports.Console({
            format: format.combine(
                format.cli(),
                format.splat(),
            ),
        }),
    ],
});

function createLogFilePath(filename: string): string {
    const directory = 'logs';
    const datePrefix = DateTime.utc().toFormat('yyyy-MM-dd_HHmm');
    return `${directory}/${datePrefix}_${filename}`;
}
