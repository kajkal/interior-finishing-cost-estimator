import { Inject, Service } from 'typedi';
import { Args, Authorized, Ctx, FieldResolver, Int, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

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
        const products = await user.products.init();
        return products.getItems();
    }

    @FieldResolver(() => Int)
    async productCount(@Root() user: User) {
        await user.products.init();
        return user.products.count();
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

    @FieldResolver(() => String, { nullable: true, description: 'User\' avatar url' })
    async avatar(@Root() user: User): Promise<string | null> {
        const [ avatar ] = await this.storageService.getResources(user.id, 'public', 'avatar');
        return avatar?.url || null;
    }


    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => User, { description: 'Returns data of the currently authenticated user.' })
    async me(@Ctx() context: AuthorizedContext) {
        return await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });
    }

}
