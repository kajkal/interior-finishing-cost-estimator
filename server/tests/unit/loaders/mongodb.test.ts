import { Container } from 'typedi';
import { MikroORM } from 'mikro-orm';

import { LoggerMockManager } from '../../__utils__/mocks-managers/LoggerMockManager';
import { connectToDatabase } from '../../../src/loaders/mongodb';
import { BaseEntity } from '../../../src/entities/BaseEntity';
import { User } from '../../../src/entities/user/User';
import { Product } from '../../../src/entities/product/Product';
import { Project } from '../../../src/entities/project/Project';
import { Offer } from '../../../src/entities/offer/Offer';


describe('mongodb loader', () => {

    const MockOrm = { em: { getRepository: jest.fn() } };

    beforeEach(() => {
        jest.spyOn(MikroORM, 'init').mockResolvedValue(MockOrm as any);
        jest.spyOn(Container, 'set').mockImplementation();
        LoggerMockManager.setupMocks();
    });

    afterEach(() => {
        (MikroORM.init as jest.Mock).mockRestore();
        (Container.set as jest.Mock).mockRestore();
        MockOrm.em.getRepository.mockRestore();
    });

    it('should connect to database', async () => {
        expect.assertions(6);

        // given/when
        await connectToDatabase();

        // then
        expect(MikroORM.init).toHaveBeenCalledTimes(1);
        expect(MikroORM.init).toHaveBeenCalledWith(expect.objectContaining({
            clientUrl: 'mongodb://localhost:27017/estimator-test',
            entities: [
                BaseEntity,
                User,
                Product,
                Project,
                Offer,
            ],
            ensureIndexes: true,
        }));
        expect(Container.set).toHaveBeenCalledTimes(2 + 4);
        expect(MockOrm.em.getRepository).toHaveBeenCalledTimes(4);
        expect(LoggerMockManager.info).toHaveBeenCalledTimes(1);
        expect(LoggerMockManager.info).toHaveBeenCalledWith(expect.stringMatching(/Successfully connected/));
    });

    it('should log error and exit when cannot connect to database', async () => {
        expect.assertions(3);

        // given
        jest.spyOn(process, 'exit').mockImplementationOnce((() => null) as () => never);
        (MikroORM.init as jest.Mock).mockImplementation(() => {
            throw new Error('CANNOT_CONNECT');
        });

        // when
        await connectToDatabase();

        // then
        expect(LoggerMockManager.error).toHaveBeenCalledTimes(1);
        expect(LoggerMockManager.error).toHaveBeenCalledWith(expect.stringMatching(/Cannot connect/), expect.any(Error));
        expect(process.exit).toHaveBeenCalledTimes(1);
    });

});
