import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';

import { User } from '../entities/User';


@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async isEmailTaken(email: string): Promise<boolean> {
        const user = await this.findOne({ email });
        return Boolean(user);
    }

}
