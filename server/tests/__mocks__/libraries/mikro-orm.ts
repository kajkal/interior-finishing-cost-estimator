import { Container } from 'typedi';


export const MockEntityManager = 'ENTITY_MANAGER_TEST_VALUE';
Container.set(MockEntityManager, MockEntityManager);

export class MockRequestContext {

    static create: jest.MockedFunction<() => undefined>;

    static setupMocks() {
        this.create = jest.fn().mockImplementation((em, next) => {
            next();
        });
    }

}

jest.mock('mikro-orm', () => ({
    EntityManager: MockEntityManager,
    RequestContext: MockRequestContext,
}));
