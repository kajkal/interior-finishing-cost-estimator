import { Container } from 'typedi';


export class MockEntityManager {
    static fork = jest.fn();
}

Container.set(MockEntityManager, MockEntityManager);

export const MockRequestContext = jest.fn();

jest.mock('mikro-orm', () => ({
    EntityManager: MockEntityManager,
    RequestContext: MockRequestContext,
}));
