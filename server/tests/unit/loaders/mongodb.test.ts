import { Container } from 'typedi';
import { MikroORM } from 'mikro-orm';

import { MockLogger } from '../../__mocks__/utils/logger';

import { connectToDatabase } from '../../../src/loaders/mongodb';
import { BaseEntity } from '../../../src/entities/BaseEntity';
import { User } from '../../../src/entities/user/User';
import { Product } from '../../../src/entities/product/Product';
import { Project } from '../../../src/entities/project/Project';
import { Inquiry } from '../../../src/entities/inquiry/Inquiry';


describe('mongodb loader', () => {

    const MockOrm = { em: { getRepository: jest.fn() } };

    beforeEach(() => {
        jest.spyOn(MikroORM, 'init').mockResolvedValue(MockOrm as any);
        jest.spyOn(Container, 'set').mockImplementation();
        MockLogger.setupMocks();
    });

    afterEach(() => {
        (MikroORM.init as jest.Mock).mockRestore();
        (Container.set as jest.Mock).mockRestore();
        MockOrm.em.getRepository.mockRestore();
    });

    it('should connect to database', async (done) => {
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
                Inquiry,
            ],
            // ensureIndexes: true,
        }));
        expect(Container.set).toHaveBeenCalledTimes(2 + 4);
        expect(MockOrm.em.getRepository).toHaveBeenCalledTimes(4);
        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith(expect.stringMatching(/Successfully connected/));
        done();
    });

    it('should log error and exit when cannot connect to database', async (done) => {
        expect.assertions(3);

        // given
        jest.spyOn(process, 'exit').mockImplementationOnce((() => null) as () => never);
        (MikroORM.init as jest.Mock).mockImplementation(() => {
            throw new Error('CANNOT_CONNECT');
        });

        // when
        await connectToDatabase();

        // then
        expect(MockLogger.error).toHaveBeenCalledTimes(1);
        expect(MockLogger.error).toHaveBeenCalledWith(expect.stringMatching(/Cannot connect/), expect.any(Error));
        expect(process.exit).toHaveBeenCalledTimes(1);
        done();
    });

});
