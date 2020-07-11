import { EntityManager } from 'mikro-orm';

import { UserRepositorySpy } from '../../__utils__/spies/repositories/UserRepositorySpy';

import { UserRepository } from '../../../src/repositories/UserRepository';
import { User } from '../../../src/entities/user/User';


describe('UserRepository class', () => {

    const repositoryUnderTest = new UserRepository({} as EntityManager, User);

    beforeEach(() => {
        UserRepositorySpy.setupSpies();
    });

    describe('isEmailTaken method', () => {

        it('should return true when user with given email address already exists in db', async () => {
            // given
            UserRepositorySpy.count.mockResolvedValueOnce(1);

            // when
            const result = await repositoryUnderTest.isEmailTaken('sampleEmail');

            // then
            expect(result).toBe(true);
            expect(UserRepositorySpy.count).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.count).toHaveBeenCalledWith({ email: 'sampleEmail' });
        });

        it('should return false when user with given email address not exists in db', async () => {
            // given
            UserRepositorySpy.count.mockResolvedValueOnce(0);

            // when
            const result = await repositoryUnderTest.isEmailTaken('sampleEmail');

            // then
            expect(result).toBe(false);
            expect(UserRepositorySpy.count).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.count).toHaveBeenCalledWith({ email: 'sampleEmail' });
        });

    });

    describe('generateUniqueSlug method', () => {

        it('should generate slug when there is no similar slug in db', async () => {
            // given
            UserRepositorySpy.count.mockResolvedValueOnce(0);

            // when
            const result = await repositoryUnderTest.generateUniqueSlug('Karol Leśniak');

            // then
            expect(result).toBe('karol-lesniak');
            expect(UserRepositorySpy.count).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.count).toHaveBeenCalledWith({ slug: expect.any(RegExp) });
        });

        it('should generate slug when there already are some similar slugs in db', async () => {
            // given
            UserRepositorySpy.count.mockResolvedValueOnce(2);

            // when
            const result = await repositoryUnderTest.generateUniqueSlug('Karol Leśniak');

            // then
            expect(result).toBe('karol-lesniak-2');
            expect(UserRepositorySpy.count).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.count).toHaveBeenCalledWith({ slug: expect.any(RegExp) });
        });

    });

});
