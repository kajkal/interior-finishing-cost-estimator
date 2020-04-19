import { MockDotenv } from '../__mocks__/libraries/dotenv';


describe('config object', () => {

    beforeEach(() => {
        jest.resetModules();
        MockDotenv.config.mockClear();
    });

    async function getConfigObject() {
        return (await import('../../src/config')).config;
    }

    it('it should create config object based on environment variables', async () => {
        expect.assertions(2);

        // given/when
        const config = await getConfigObject();

        // then
        expect(config).toEqual({
            port: 5005,
            logLevel: 'info',
        });
        expect(MockDotenv.config).toHaveBeenCalledTimes(1); // variables should be from .env file
    });

    describe('\'NODE_ENV\' variable', () => {

        let originalProcessEnv: NodeJS.ProcessEnv;

        beforeEach(() => {
            originalProcessEnv = process.env;
            process.env = { ...originalProcessEnv };
        });

        afterEach(() => {
            process.env = originalProcessEnv;
        });

        it('should set to \'development\' if \'NODE_ENV\' is not defined', async () => {
            expect.assertions(1);

            // given
            delete process.env.NODE_ENV;

            // when
            await getConfigObject();

            // then
            expect(process.env.NODE_ENV).toBe('development');
        });

        it('should use existing value if \'NODE_ENV\' is defined ', async () => {
            expect.assertions(1);

            // given
            process.env.NODE_ENV = 'production';

            // when
            await getConfigObject();

            // then
            expect(process.env.NODE_ENV).toBe('production');
        });

    });

});
