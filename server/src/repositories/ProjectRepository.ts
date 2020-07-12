import { EntityRepository, Repository } from 'mikro-orm';

import { generateSlugBase, generateUniqueSlug } from '../utils/generateUniqueSlug';
import { Project } from '../entities/project/Project';


@Repository(Project)
export class ProjectRepository extends EntityRepository<Project> {

    async generateUniqueSlug(name: string): Promise<string> {
        const slugBase = generateSlugBase(name);
        const projectsSlugs = await this.find({
            slug: new RegExp(`^${slugBase}(-\\d+)?$`),
        }, {
            fields: [ 'slug' ],
        });
        const takenSlugs = projectsSlugs.map(it => it.slug);
        return generateUniqueSlug(slugBase, takenSlugs);
    }

}
