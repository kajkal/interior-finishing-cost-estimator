import { UserRepository } from '../../../src/repositories/UserRepository';
import { MockUserRepository } from './MockUserRepository';


export const MockConnectionManager = {
    has: () => true,
    get: () => ({
        getCustomRepository: (repositoryType: any) => {
            switch (repositoryType) {
                case UserRepository:
                    return MockUserRepository;
                default:
                    console.error(`No mock repository found for ${repositoryType}`);
            }
        },
    }),
};
