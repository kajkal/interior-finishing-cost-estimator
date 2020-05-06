import { EntityRepository, Repository } from 'mikro-orm';

import { Project } from '../entities/project/Project';


@Repository(Project)
export class ProjectRepository extends EntityRepository<Project> {

}
