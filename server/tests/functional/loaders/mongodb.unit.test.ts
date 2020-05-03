import { createConnection } from 'typeorm';
import { LoggerMockManager } from '../../__mocks__/utils/LoggerMockManager';
import { connectToDatabase } from '../../../src/loaders/mongodb';


jest.mock('typeorm');
jest.mock('../../../src/entities/User', () => ({
    User: class {},
}));

describe('mongodb loader', () => {

    beforeEach(() => {
        LoggerMockManager.setupMocks();
    });

    afterEach(() => {
        (createConnection as jest.Mock).mockClear();
    });

    it('should connect to database', async () => {
        expect.assertions(4);

        // given/when
        await connectToDatabase();

        // then
        expect(createConnection).toHaveBeenCalledTimes(1);
        expect(createConnection).toHaveBeenCalledWith(expect.objectContaining({
            type: 'mongodb',
            url: 'MONGODB_URL_TEST_VALUE',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }));
        expect(LoggerMockManager.info).toHaveBeenCalledTimes(1);
        expect(LoggerMockManager.info).toHaveBeenCalledWith(expect.stringMatching(/Successfully connected/));
    });

    it('should log error and exit when cannot connect to database', async () => {
        expect.assertions(3);

        // given
        jest.spyOn(process, 'exit').mockImplementationOnce((() => null) as () => never);
        (createConnection as jest.Mock).mockImplementation(() => {
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
