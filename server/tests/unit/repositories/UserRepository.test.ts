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

        const slugsFromDb = [
            'karol-lesniak',
            'karol-lesniak-1',
            'sample',
        ];

        beforeEach(() => {
            UserRepositorySpy.find.mockImplementation(({ slug: slugRegExp }: any): any => slugsFromDb
                .filter(slug => slugRegExp.test(slug))
                .map(slug => ({ slug })),
            );
        });

        it('should generate slug when there are no similar slugs in db', async () => {
            const result = await repositoryUnderTest.generateUniqueSlug('Leśniak Karol');
            expect(result).toBe('lesniak-karol');
        });

        it('should generate unique slug when there are similar slugs in db', async () => {
            const result1 = await repositoryUnderTest.generateUniqueSlug('Karol Leśniak');
            expect(result1).toBe('karol-lesniak-2');

            const result2 = await repositoryUnderTest.generateUniqueSlug('Sample');
            expect(result2).toBe('sample-1');
        });

    });

});
