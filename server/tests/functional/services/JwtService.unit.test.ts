import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { JwtService } from '../../../src/services/JwtService';
import { User } from '../../../src/entities/user/User';


describe('JwtService class', () => {

    const serviceUnderTest = new JwtService();

    beforeEach(() => {
        jest.spyOn(jwt, 'sign');
        jest.spyOn(jwt, 'verify');
    });

    afterEach(() => {
        (jwt.sign as jest.Mock).mockRestore();
        (jwt.verify as jest.Mock).mockRestore();
    });

    it('should generate new JWT and create new cookie', () => {
        // given
        const context = { res: { cookie: jest.fn() } } as unknown as ExpressContext;
        const user = { id: 'TEST_USER_ID' } as unknown as User;

        // when
        serviceUnderTest.generate(context, user);

        // then
        expect(jwt.sign).toHaveBeenCalledTimes(1);
        expect(jwt.sign).toHaveBeenCalledWith({ userId: 'TEST_USER_ID' }, 'JWT_PRIVATE_KEY_TEST_VALUE');
        expect(context.res.cookie).toHaveBeenCalledTimes(1);
        expect(context.res.cookie).toHaveBeenCalledWith('jwt', expect.any(String), expect.objectContaining({
            httpOnly: true,
        }));
    });

    it('should verify and return JWT payload if token from cookie is valid', () => {
        // given
        const samplePayload = { userId: 'TEST_USER_ID' };
        const validSampleToken = jwt.sign(samplePayload, 'JWT_PRIVATE_KEY_TEST_VALUE');
        const context = { req: { headers: { cookie: `jwt=${validSampleToken}` } } } as unknown as ExpressContext;

        // when
        const extractedPayload = serviceUnderTest.verify(context);

        // then
        expect(extractedPayload).toMatchObject(samplePayload);
        expect(jwt.verify).toHaveBeenCalledTimes(1);
        expect(jwt.verify).toHaveBeenCalledWith(validSampleToken, 'JWT_PRIVATE_KEY_TEST_VALUE');
    });

    it('should throw error if token from cookie is invalid', () => {
        // given
        const samplePayload = { userId: 'TEST_USER_ID' };
        const validSampleToken = jwt.sign(samplePayload, 'WRONG_PRIVATE_KEY');
        const context = { req: { headers: { cookie: `jwt=${validSampleToken}` } } } as unknown as ExpressContext;

        // when/then
        expect(() => serviceUnderTest.verify(context)).toThrow(new JsonWebTokenError('invalid signature'));
        expect(jwt.verify).toHaveBeenCalledTimes(1);
        expect(jwt.verify).toHaveBeenCalledWith(validSampleToken, 'JWT_PRIVATE_KEY_TEST_VALUE');
    });

    it('should throw error if token from cookie is missing', () => {
        // given
        const context = { req: { headers: { cookie: '' } } } as unknown as ExpressContext;

        // when/then
        expect(() => serviceUnderTest.verify(context)).toThrow(new JsonWebTokenError('jwt must be provided'));
        expect(jwt.verify).toHaveBeenCalledTimes(1);
        expect(jwt.verify).toHaveBeenCalledWith(undefined, 'JWT_PRIVATE_KEY_TEST_VALUE');
    });

    it('should invalidate cookie with JWT', () => {
        // given
        const context = { res: { cookie: jest.fn() } } as unknown as ExpressContext;

        // when
        serviceUnderTest.invalidate(context);

        // then
        expect(context.res.cookie).toHaveBeenCalledTimes(1);
        expect(context.res.cookie).toHaveBeenCalledWith('jwt', '', expect.objectContaining({
            maxAge: 0,
        }));
    });

});
