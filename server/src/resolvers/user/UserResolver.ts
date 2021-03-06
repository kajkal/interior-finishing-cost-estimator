import { ObjectID } from 'mongodb';
import { QueryOrder } from 'mikro-orm';
import { Inject, Service } from 'typedi';
import { Args, Authorized, Ctx, FieldResolver, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { StorageService } from '../../services/storage/StorageService';
import { UserRepository } from '../../repositories/UserRepository';
import { ElementSlug } from '../common/input/ElementSlug';
import { Product } from '../../entities/product/Product';
import { Project } from '../../entities/project/Project';
import { Inquiry } from '../../entities/inquiry/Inquiry';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/user/User';


@Service()
@Resolver(() => User)
export class UserResolver {

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly storageService!: StorageService;


    @FieldResolver(() => [ Product ])
    async products(@Root() user: User) {
        const products = await user.products.init({
            orderBy: { createdAt: QueryOrder.DESC },
        });
        return products.getItems();
    }

    @FieldResolver(() => String, { nullable: true, description: 'User\' avatar url' })
    async avatar(@Root() user: User): Promise<string | null> {
        const [ avatar ] = await this.storageService.getResources(user.id, 'public', 'avatar');
        return avatar?.url || null;
    }

    @FieldResolver(() => [ Project ], { description: 'User\' all projects.' })
    async projects(@Root() user: User) {
        const projects = await user.projects.init();
        return projects.getItems();
    }

    @FieldResolver(() => Project, { nullable: true, description: 'User project with given project id.' })
    async project(@Args() { slug }: ElementSlug, @Root() user: User) {
        const projects = await user.projects.init({ where: { slug } });
        const [ project ] = projects.getItems();
        return project;
    }

    @FieldResolver(() => [ Inquiry ], { description: 'Inquiries opened by user' })
    async inquiries(@Root() user: User) {
        return await user.inquiries.loadItems();
    }

    @FieldResolver(() => [ String ], { description: 'Identifiers of bookmarked inquiries' })
    async bookmarkedInquiries(@Root() user: User) {
        return user.bookmarkedInquiries.getIdentifiers();
    }


    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => User, { description: 'Returns data of the currently authenticated user.' })
    async me(@Ctx() context: AuthorizedContext) {
        return await this.userRepository.findOneOrFail({ _id: new ObjectID(context.jwtPayload.sub) });
    }

}
