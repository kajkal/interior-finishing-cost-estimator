describe('config object', () => {

    let originalProcessEnv: NodeJS.ProcessEnv;
    const MockDotenv = {
        config: jest.fn((options) => {
            jest.requireActual('dotenv').config(options);
        }),
    };

    beforeAll(() => {
        jest.resetModules();
        jest.mock('dotenv', () => MockDotenv);
    });

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
                webClient: expect.objectContaining({
                    url: expect.any(String),
                }),
                email: expect.objectContaining({
                    apiKey: expect.any(String),
                }),
                logger: expect.objectContaining({
                    logLevel: expect.any(String),
                }),
                dataBase: expect.objectContaining({
                    mongodbUrl: expect.any(String),
                    cacheDir: './tmp',
                }),
                token: {
                    access: expect.objectContaining({
                        jwt: {
                            privateKey: expect.any(String),
                            options: expect.any(Object),
                        },
                    }),
                    refresh: expect.objectContaining({
                        jwt: {
                            privateKey: expect.any(String),
                            options: expect.any(Object),
                        },
                    }),
                    emailAddressConfirmation: expect.objectContaining({
                        jwt: {
                            privateKey: expect.any(String),
                            options: expect.any(Object),
                        },
                    }),
                    passwordReset: expect.objectContaining({
                        jwt: {
                            privateKey: expect.any(String),
                            options: expect.any(Object),
                        },
                    }),
                },
                gcp: expect.objectContaining({
                    storageBucketName: expect.any(String),
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
            webClient: expect.objectContaining({
                url: 'http://localhost:3005',
            }),
            email: expect.objectContaining({
                apiKey: 'SENDGRID_API_KEY_TEST_VALUE',
            }),
            logger: expect.objectContaining({
                logLevel: 'debug',
            }),
            dataBase: expect.objectContaining({
                mongodbUrl: 'mongodb://localhost:27017/estimator-test',
                cacheDir: './tmp',
            }),
            token: {
                access: expect.objectContaining({
                    jwt: {
                        privateKey: 'ACCESS_TOKEN_PRIVATE_KEY_TEST_VALUE',
                        options: expect.any(Object),
                    },
                }),
                refresh: expect.objectContaining({
                    jwt: {
                        privateKey: 'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE',
                        options: expect.any(Object),
                    },
                }),
                emailAddressConfirmation: expect.objectContaining({
                    jwt: {
                        privateKey: 'EMAIL_ADDRESS_CONFIRMATION_TOKEN_PRIVATE_KEY_TEST_VALUE',
                        options: expect.any(Object),
                    },
                }),
                passwordReset: expect.objectContaining({
                    jwt: {
                        privateKey: 'PASSWORD_RESET_TOKEN_PRIVATE_KEY_TEST_VALUE',
                        options: expect.any(Object),
                    },
                }),
            },
            gcp: expect.objectContaining({
                storageBucketName: 'GOOGLE_STORAGE_BUCKET_NAME_TEST_VALUE',
            }),
        });
        expect(MockDotenv.config).toHaveBeenCalledTimes(1);
        expect(MockDotenv.config).toHaveBeenCalledWith({
            path: expect.stringMatching(/^.*\.env\.test$/),
        });
    });

});
