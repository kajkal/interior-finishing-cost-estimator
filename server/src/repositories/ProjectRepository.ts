import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';

import { Project } from '../entities/Project';


@Service()
@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {

}
