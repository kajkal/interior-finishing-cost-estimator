import slugify from 'slugify';
import { EntityRepository, Repository } from 'mikro-orm';

import { User } from '../entities/user/User';


@Repository(User)
export class UserRepository extends EntityRepository<User> {

    async isEmailTaken(email: string): Promise<boolean> {
        const userCount = await this.count({ email });
        return userCount !== 0;
    }

    async generateUniqueSlug(name: string): Promise<string> {
        const slugBase = slugify(name, { lower: true, strict: true });
        const slugCount = await this.count({ slug: new RegExp(`^${slugBase}-?\\d*$`) });
        return (slugCount)
            ? `${slugBase}-${slugCount}`
            : slugBase;
    }

}
