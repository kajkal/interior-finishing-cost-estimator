import { MockDotenv } from '../../__mocks__/libraries/dotenv';


describe('config object', () => {

    let originalProcessEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalProcessEnv = process.env;
        process.env = { ...originalProcessEnv };
    });

    afterEach(() => {
        jest.resetModules();
        MockDotenv.config.mockClear();
        process.env = originalProcessEnv;
    });

    it('should throw exception if \'NODE_ENV\' variable is not defined', async () => {
        expect.assertions(1);

        // given
        delete process.env.NODE_ENV;

        // when/then
        await expect(import('../../../src/config/config')).rejects.toThrow('The NODE_ENV environment variable is required but was not specified.');
    });

    [ 'development', 'production' ].forEach((environment: string) => {
        it(`should create config object based on '${environment}' environment variables`, async () => {
            expect.assertions(3);

            // given
            process.env.NODE_ENV = environment;

            // when
            const { config } = await import('../../../src/config/config');

            // then
            expect(config).toEqual({
                server: expect.objectContaining({
                    port: expect.any(Number),
                }),
                logger: expect.objectContaining({
                    logLevel: expect.any(String),
                }),
                dataBase: expect.objectContaining({
                    mongodbUrl: expect.any(String),
                }),
                auth: expect.objectContaining({
                    jwtPrivateKey: expect.any(String),
                }),
            });
            expect(MockDotenv.config).toHaveBeenCalledTimes(1);
            expect(MockDotenv.config).toHaveBeenCalledWith({
                path: expect.stringMatching(/^.*\.env$/),
            });
        });
    });

    it('should create config object based on \'test\' environment variables', async () => {
        expect.assertions(3);

        // given/when
        const { config } = await import('../../../src/config/config');

        // then
        expect(config).toEqual({
            server: expect.objectContaining({
                port: 4005,
            }),
            logger: expect.objectContaining({
                logLevel: 'info',
            }),
            dataBase: expect.objectContaining({
                mongodbUrl: 'MONGODB_URL_TEST_VALUE',
            }),
            auth: expect.objectContaining({
                jwtPrivateKey: 'JWT_PRIVATE_KEY_TEST_VALUE',
            }),
        });
        expect(MockDotenv.config).toHaveBeenCalledTimes(1);
        expect(MockDotenv.config).toHaveBeenCalledWith({
            path: expect.stringMatching(/^.*\.env\.test$/),
        });
    });

});
