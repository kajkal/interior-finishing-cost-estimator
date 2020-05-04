import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ApolloError } from 'apollo-server-errors/src/index';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { ProjectRepository } from '../../repositories/ProjectRepository';
import { AuthorizedContext } from '../../utils/authChecker';
import { logAccess } from '../../utils/logAccess';
import { Project } from '../../entities/Project';


@Service()
@Resolver()
export class ProjectResolver {

    @InjectRepository()
    private readonly projectResolver!: ProjectRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Project ])
    async projects(@Ctx() context: AuthorizedContext): Promise<Project[]> {
        return this.projectResolver.find();
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Project)
    async createProject(@Ctx() context: AuthorizedContext): Promise<Project> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Project)
    async updateProject(@Ctx() context: AuthorizedContext): Promise<Project> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteProject(@Ctx() context: AuthorizedContext): Promise<Boolean> {
        throw new ApolloError('not yet implemented');
    }

}
