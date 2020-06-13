import { sign, TokenExpiredError } from 'jsonwebtoken';
import { TokenVerifier } from '../../../../code/utils/token/TokenVerifier';


describe('TokenVerifier class', () => {

    it('should throw error when token is undefined', () => {
        expect(() => {
            TokenVerifier.create().verifyTokenSubject();
        }).toThrow('INVALID_TOKEN_PAYLOAD');
    });

    it('should throw error when token is null', () => {
        expect(() => {
            TokenVerifier.create(null).verifyTokenSubject();
        }).toThrow('INVALID_TOKEN_PAYLOAD');
    });

    it('should throw error when token is empty string', () => {
        expect(() => {
            TokenVerifier.create('').verifyTokenSubject();
        }).toThrow('INVALID_TOKEN_PAYLOAD');
    });

    it('should throw error when token is invalid', () => {
        expect(() => {
            TokenVerifier.create('not a jwt').verifyTokenSubject();
        }).toThrow('INVALID_TOKEN_PAYLOAD');
    });

    it('should throw error when token is invalid jwt', () => {
        expect(() => {
            TokenVerifier.create('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdwIiOiJhIn0._').verifyTokenSubject();
        }).toThrow(/Unexpected token .+ in JSON/);
    });

    it('should throw error when token payload is not an object', () => {
        expect(() => {
            TokenVerifier.create(sign('payload', '_')).verifyTokenSubject();
        }).toThrow('INVALID_TOKEN_PAYLOAD');
    });

    it('should throw error when token subject is missing', () => {
        expect(() => {
            TokenVerifier.create(sign({}, '_')).verifyTokenSubject();
        }).toThrow('INVALID_TOKEN_SUBJECT');
    });

    it('should not throw error when token subject is defined', () => {
        expect(() => {
            TokenVerifier.create(sign({ sub: 'subject' }, '_')).verifyTokenSubject();
        }).not.toThrow();
    });

    it('should throw error when token expiration date is not defined', (done) => {
        try {
            TokenVerifier.create(sign({}, '_')).verifyTokenExpiration();
        } catch (error) {
            expect(error).toBeInstanceOf(TokenExpiredError);
            expect(error.message).toBe('TOKEN_EXPIRED');
            expect(error.expiredAt).toBeInstanceOf(Date);
            expect(error.expiredAt.valueOf()).toBe(0);
            done();
        }
    });

    it('should throw error when token expire now + 10s', (done) => {
        try {
            TokenVerifier.create(sign({}, '_', { expiresIn: '10s' })).verifyTokenExpiration();
        } catch (error) {
            expect(error).toBeInstanceOf(TokenExpiredError);
            expect(error.message).toBe('TOKEN_EXPIRED');
            expect(error.expiredAt).toBeInstanceOf(Date);
            expect(error.expiredAt.valueOf()).not.toBe(0);
            done();
        }
    });

    it('should not throw error when token is expired (skipThisStep flag is set)', () => {
        expect(() => {
            TokenVerifier.create(sign({}, '_', { expiresIn: '10s' })).verifyTokenExpiration(true);
        }).not.toThrow();
    });

    it('should not throw error when token is not expired', () => {
        expect(() => {
            TokenVerifier.create(sign({}, '_', { expiresIn: '11s' })).verifyTokenExpiration();
        }).not.toThrow();
    });

});
