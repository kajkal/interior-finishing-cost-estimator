import { EntityRepository, Repository } from 'mikro-orm';

import { generateSlugBase, generateUniqueSlug } from '../utils/generateUniqueSlug';
import { User } from '../entities/user/User';


@Repository(User)
export class UserRepository extends EntityRepository<User> {

    async isEmailTaken(email: string): Promise<boolean> {
        const userCount = await this.count({ email });
        return userCount !== 0;
    }

    async generateUniqueSlug(name: string): Promise<string> {
        const slugBase = generateSlugBase(name);
        const usersSlugs = await this.find({
            slug: new RegExp(`^${slugBase}(-\\d+)?$`),
        }, {
            fields: [ 'slug' ],
        });
        const takenSlugs = usersSlugs.map(it => it.slug);
        return generateUniqueSlug(slugBase, takenSlugs);
    }

}
