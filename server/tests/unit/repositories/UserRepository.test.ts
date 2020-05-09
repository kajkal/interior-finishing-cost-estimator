import { EntityManager } from 'mikro-orm';

import { UserRepository } from '../../../src/repositories/UserRepository';
import { User } from '../../../src/entities/user/User';


describe('UserRepository class', () => {

    const repositoryUnderTest = new UserRepository({} as EntityManager, User);

    describe('isEmailTaken method', () => {

        let findOneSpy: jest.SpiedFunction<typeof UserRepository.prototype.findOne>;

        beforeEach(() => {
            findOneSpy = jest.spyOn(repositoryUnderTest, 'findOne');
        });

        afterEach(() => {
            findOneSpy.mockRestore();
        });

        it('should return true if user with given email address already exists in db', async () => {
            expect.assertions(3);

            // given
            findOneSpy.mockResolvedValueOnce({} as User);

            // when
            const result = await repositoryUnderTest.isEmailTaken('sampleEmail');

            // then
            expect(result).toBe(true);
            expect(repositoryUnderTest.findOne).toHaveBeenCalledTimes(1);
            expect(repositoryUnderTest.findOne).toHaveBeenCalledWith({ email: 'sampleEmail' });
        });

        it('should return false if user with given email address not exists in db', async () => {
            expect.assertions(3);

            // given
            findOneSpy.mockResolvedValueOnce(null);

            // when
            const result = await repositoryUnderTest.isEmailTaken('sampleEmail');

            // then
            expect(result).toBe(false);
            expect(repositoryUnderTest.findOne).toHaveBeenCalledTimes(1);
            expect(repositoryUnderTest.findOne).toHaveBeenCalledWith({ email: 'sampleEmail' });
        });

    });

});
