import { Container } from 'typedi';

import { GraphQLLoggerMockManager } from '../../../__mocks__/utils/LoggerMockManager';
import { MockProjectRepository } from '../../../__mocks__/repositories/MockProjectRepository';

import { ProjectRepository } from '../../../../src/repositories/ProjectRepository';


describe('ProjectResolver class', () => {

    beforeAll(() => {
        Container.set(ProjectRepository, MockProjectRepository);
    });

    beforeEach(() => {
        GraphQLLoggerMockManager.setupMocks();
        MockProjectRepository.setupMocks();
    });

    it.todo('pass');

});
