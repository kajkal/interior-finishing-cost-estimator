import { Inject, Service } from 'typedi';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Args, Authorized, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';

import { generateSlugBase, generateUniqueSlug } from '../../utils/generateUniqueSlug';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { ProjectRepository } from '../../repositories/ProjectRepository';
import { RoomCreateFormData } from './input/RoomCreateFormData';
import { RoomUpdateFormData } from './input/RoomUpdateFormData';
import { RoomDeleteFormData } from './input/RoomDeleteFormData';
import { Room } from '../../entities/project/Room';
import { logAccess } from '../../utils/logAccess';


@Service()
@Resolver(() => Room)
export class RoomResolver {

    @Inject()
    private readonly projectRepository!: ProjectRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Room)
    async createRoom(@Args() { projectSlug, ...data }: RoomCreateFormData, @Ctx() context: AuthorizedContext): Promise<Room> {
        const project = await this.projectRepository.findOne({ slug: projectSlug });

        if (project) {
            if (project.user.id === context.jwtPayload.sub) {
                const existingRooms = project.rooms || [];
                const newRoom: Room = {
                    id: generateUniqueSlug(generateSlugBase(data.type), existingRooms.map(({ id }) => id)),
                    ...data,
                } as any;
                project.rooms = [ ...existingRooms, newRoom ];
                await this.projectRepository.persistAndFlush(project);
                return newRoom;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Room)
    async updateRoom(@Args() { projectSlug, roomId, ...data }: RoomUpdateFormData, @Ctx() context: AuthorizedContext): Promise<Room> {
        const project = await this.projectRepository.findOne({ slug: projectSlug });

        if (project) {
            if (project.user.id === context.jwtPayload.sub) {
                const roomToUpdate = project.rooms?.find(({ id }) => id === roomId);
                if (roomToUpdate) {
                    const updatedRoom = { ...roomToUpdate, ...data };
                    project.rooms = project.rooms?.map((room) => (room === roomToUpdate) ? updatedRoom : room);
                    await this.projectRepository.persistAndFlush(project);
                    return updatedRoom;
                }

                throw new ForbiddenError('ROOM_NOT_FOUND');
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteRoom(@Args() { projectSlug, roomId }: RoomDeleteFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const project = await this.projectRepository.findOne({ slug: projectSlug });

        if (project) {
            if (project.user.id === context.jwtPayload.sub) {
                project.rooms = project.rooms?.filter(({ id }) => id !== roomId);
                await this.projectRepository.persistAndFlush(project);
                return true;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PROJECT_NOT_FOUND');
    }

}
