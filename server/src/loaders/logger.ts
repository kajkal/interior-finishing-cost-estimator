import { createLogger, format, transports } from 'winston';
import { config } from '../config';


export const logger = createLogger({
    level: config.logLevel,
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    transports: [],
});

if (process.env.NODE_ENV === 'production') {
    // production logger transports
    console.log('prod build');
    logger.add(new transports.File({
        filename: 'server.log',
    }));
} else {
    // development logger transports
    console.log('dev build');
    logger.add(new transports.Console({
        format: format.combine(
            format.cli(),
            format.splat(),
        ),
    }));
}
