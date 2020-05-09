import { Container } from 'typedi';
import { GraphQLLogger, Logger } from '../src/utils/logger';
import { GraphQLLoggerMockManager, LoggerMockManager } from './__utils__/mocks-managers/LoggerMockManager';


// @ts-ignore
Container.set(GraphQLLogger, GraphQLLoggerMockManager);
// @ts-ignore
Container.set(Logger, LoggerMockManager);
