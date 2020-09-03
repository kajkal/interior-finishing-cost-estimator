import { wrap } from 'mikro-orm';
import { Inject, Service } from 'typedi';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Args, Authorized, Ctx, FieldResolver, Mutation, Resolver, Root, UseMiddleware } from 'type-graphql';

import { ProjectRepository } from '../../repositories/ProjectRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { logAccess } from '../../utils/logAccess';
import { Project } from '../../entities/project/Project';
import { StorageService } from '../../services/storage/StorageService';
import { ResourceData } from '../common/output/ResourceData';
import { ProjectCreateFormData } from './input/ProjectCreateFormData';
import { ProjectUpdateFormData } from './input/ProjectUpdateFormData';
import { ResourceCreateFormData } from './input/ResourceCreateFormData';
import { ResourceDeleteFormData } from './input/ResourceDeleteFormData';
import { ProjectDeleteFormData } from './input/ProjectDeleteFormData';


@Service()
@Resolver(() => Project)
export class ProjectResolver {

    @Inject()
    private readonly projectRepository!: ProjectRepository;

    @Inject()
    private readonly storageService!: StorageService;


    @FieldResolver(() => [ ResourceData ])
    async files(@Root() project: Project): Promise<ResourceData[]> {
        return await this.storageService.getResources(project.user.id, project.id);
    }


    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Project)
    async createProject(@Args() data: ProjectCreateFormData, @Ctx() context: AuthorizedContext): Promise<Project> {
        const { sub: userId } = context.jwtPayload;
        const slug = await this.projectRepository.generateUniqueSlug(data.name);

        const project = this.projectRepository.create({ ...data, user: userId, slug });
        await this.projectRepository.persistAndFlush(project);

        return project;
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Project)
    async updateProject(@Args() { projectSlug, name: newName, ...data }: ProjectUpdateFormData, @Ctx() context: AuthorizedContext): Promise<Project> {
        const projectToUpdate = await this.projectRepository.findOne({ slug: projectSlug });

        if (projectToUpdate) {
            if (projectToUpdate.user.id === context.jwtPayload.sub) {

                if (projectToUpdate.name !== newName) {
                    projectToUpdate.name = newName;
                    projectToUpdate.slug = await this.projectRepository.generateUniqueSlug(newName);
                }

                wrap(projectToUpdate).assign(data);

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
    async deleteProject(@Args() { projectSlug }: ProjectDeleteFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const projectToRemove = await this.projectRepository.findOne({ slug: projectSlug });

        if (projectToRemove) {
            if (projectToRemove.user.id === context.jwtPayload.sub) {
                await this.projectRepository.removeAndFlush(projectToRemove);
                return true;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => ResourceData)
    async uploadProjectFile(@Args() { projectSlug, ...data }: ResourceCreateFormData, @Ctx() context: AuthorizedContext): Promise<ResourceData> {
        const projectToUpdate = await this.projectRepository.findOne({ slug: projectSlug });

        if (projectToUpdate) {
            if (projectToUpdate.user.id === context.jwtPayload.sub) {
                const file = await data.file;
                return await this.storageService.uploadResource({
                    ...file,
                    userId: context.jwtPayload.sub,
                    directory: projectToUpdate.id,
                    metadata: {
                        description: data.description || undefined, // null is replaced to ''
                    },
                });
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteProjectFile(@Args() { projectSlug, resourceName }: ResourceDeleteFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const projectToUpdate = await this.projectRepository.findOne({ slug: projectSlug });

        if (projectToUpdate) {
            if (projectToUpdate.user.id === context.jwtPayload.sub) {
                await this.storageService.deleteResources(context.jwtPayload.sub, projectToUpdate.id, resourceName);
                return true;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

}
