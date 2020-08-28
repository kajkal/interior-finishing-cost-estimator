import { extname } from 'path';
import { ObjectID } from 'mongodb';
import { randomBytes } from 'crypto';
import { Inject, Service } from 'typedi';
import { UserInputError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Args, Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { StorageService } from '../../services/storage/StorageService';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { ProfileUpdateFormData } from './input/ProfileUpdateFormData';
import { UserRepository } from '../../repositories/UserRepository';
import { AuthService } from '../../services/auth/AuthService';
import { ResourceData } from '../common/output/ResourceData';
import { ProfileFormData } from './input/ProfileFormData';
import { logAccess } from '../../utils/logAccess';
import { Profile } from './output/Profile';


@Service()
@Resolver()
export class ProfileResolver {

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly authService!: AuthService;

    @Inject()
    private readonly storageService!: StorageService;


    @UseMiddleware(logAccess)
    @Query(() => Profile, { description: 'Returns user\', publicly available, profile data' })
    async profile(@Args() { userSlug }: ProfileFormData, @Ctx() context: ExpressContext): Promise<Profile> {
        const user = await this.userRepository.findOne({ slug: userSlug });

        const isUserRequestedOwnProfileData = (profileOwnerId: string) => {
            try {
                return profileOwnerId === this.authService.verifyAccessToken(context.req).sub;
            } catch (_error) {
                throw new UserInputError('USER_NOT_FOUND');
            }
        };

        if (user) {
            if (!user.hidden || isUserRequestedOwnProfileData(user.id)) {
                const [ avatar ] = await this.storageService.getResources(user.id, 'public', 'avatar');
                return {
                    userSlug: user.slug,
                    name: user.name,
                    avatar: avatar?.url,
                    description: user.profileDescription,
                    location: user.location,
                };
            }
        }

        throw new UserInputError('USER_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Profile)
    async updateProfile(@Args() { name: newName, avatar, removeCurrentAvatar, description, location }: ProfileUpdateFormData, @Ctx() context: AuthorizedContext): Promise<Profile> {
        const user = await this.userRepository.findOneOrFail({ _id: new ObjectID(context.jwtPayload.sub) });
        const [ currentAvatar ] = await this.storageService.getResources(user.id, 'public', 'avatar');
        let newAvatar: ResourceData | undefined = currentAvatar;

        // remove old avatar
        if (removeCurrentAvatar || (avatar && currentAvatar)) {
            await this.storageService.deleteResources(user.id, 'public', 'avatar');
            newAvatar = undefined;
        }

        // add new avatar
        if (avatar) {
            const avatarFile = await avatar;
            const avatarFileExt = extname(avatarFile.filename);
            const avatarFilename = `avatar_${randomBytes(3).toString('hex')}${avatarFileExt}`;
            newAvatar = await this.storageService.uploadResource({
                ...avatarFile,
                filename: avatarFilename,
                userId: user.id,
                directory: 'public',
            });
        }

        if (newName && (user.name !== newName)) {
            user.name = newName;
            user.slug = await this.userRepository.generateUniqueSlug(newName);
        }

        user.profileDescription = description;
        user.location = location;
        await this.userRepository.persistAndFlush(user);

        return {
            userSlug: user.slug,
            name: user.name,
            avatar: newAvatar?.url,
            description: user.profileDescription,
            location: user.location,
        };
    }

}
