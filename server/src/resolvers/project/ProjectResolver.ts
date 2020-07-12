import { Inject, Service } from 'typedi';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Args, Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { ProjectRepository } from '../../repositories/ProjectRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { logAccess } from '../../utils/logAccess';
import { Project } from '../../entities/project/Project';
import { ProjectFormData } from './input/ProjectFormData';
import { ElementId } from '../common/input/ElementId';


@Service()
@Resolver(() => Project)
export class ProjectResolver {

    @Inject()
    private readonly projectRepository!: ProjectRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Project ])
    async projects(@Ctx() context: AuthorizedContext): Promise<Project[]> {
        return this.projectRepository.findAll();
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Project)
    async createProject(@Args() { id: _, ...data }: ProjectFormData, @Ctx() context: AuthorizedContext): Promise<Project> {
        const { sub: userId } = context.jwtPayload;
        const slug = await this.projectRepository.generateUniqueSlug(data.name);

        const project = this.projectRepository.create({ ...data, user: userId, slug });
        await this.projectRepository.persistAndFlush(project);

        return project;
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Project)
    async updateProject(@Args() { id, ...data }: ProjectFormData, @Ctx() context: AuthorizedContext): Promise<Project> {
        const projectToUpdate = await this.projectRepository.findOne({ id });

        if (projectToUpdate) {
            if (projectToUpdate.user.id === context.jwtPayload.sub) {
                Object.assign(projectToUpdate, data);
                await this.projectRepository.persistAndFlush(projectToUpdate);
                return projectToUpdate;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteProject(@Args() { id }: ElementId, @Ctx() context: AuthorizedContext): Promise<Boolean> {
        const projectToRemove = await this.projectRepository.findOne({ id });

        if (projectToRemove) {
            if (projectToRemove.user.id === context.jwtPayload.sub) {
                await this.projectRepository.removeAndFlush(projectToRemove);
                return true;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

}
