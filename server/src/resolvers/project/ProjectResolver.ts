import { Inject, Service } from 'typedi';
import { ApolloError } from 'apollo-server-express';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { ProjectRepository } from '../../repositories/ProjectRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { logAccess } from '../../utils/logAccess';
import { Project } from '../../entities/project/Project';


@Service()
@Resolver(() => Project)
export class ProjectResolver {

    @Inject()
    private readonly projectResolver!: ProjectRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Project ])
    async projects(@Ctx() context: AuthorizedContext): Promise<Project[]> {
        return this.projectResolver.findAll();
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
