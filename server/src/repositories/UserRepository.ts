import { EntityRepository, Repository } from 'mikro-orm';

import { User } from '../entities/user/User';


@Repository(User)
export class UserRepository extends EntityRepository<User> {

    async isEmailTaken(email: string): Promise<boolean> {
        const user = await this.findOne({ email });
        return Boolean(user);
    }

}
