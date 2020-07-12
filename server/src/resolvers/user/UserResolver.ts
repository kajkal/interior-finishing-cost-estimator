import { Inject, Service } from 'typedi';
import { Authorized, Ctx, FieldResolver, Query, Resolver, Root, UseMiddleware, Int } from 'type-graphql';

import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { UserRepository } from '../../repositories/UserRepository';
import { Product } from '../../entities/product/Product';
import { Project } from '../../entities/project/Project';
import { Offer } from '../../entities/offer/Offer';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/user/User';


@Service()
@Resolver(() => User)
export class UserResolver {

    @Inject()
    private readonly userRepository!: UserRepository;


    @FieldResolver(() => [ Product ])
    async products(@Root() user: User) {
        console.log('loading products for user', user.email);
        return await user.products.loadItems();
    }

    @FieldResolver(() => Int)
    async productCount(@Root() user: User) {
        console.log('loading productCount for user', user.email);
        await user.products.init();
        return user.products.count();
    }

    @FieldResolver(() => [ Project ])
    async projects(@Root() user: User) {
        console.log('loading projects for user', user.email);
        return await user.projects.loadItems();
    }

    @FieldResolver(() => [ Offer ])
    async offers(@Root() user: User) {
        console.log('loading offers for user', user.email);
        return await user.offers.loadItems();
    }


    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => User, { description: 'Returns data of the currently authenticated user.' })
    async me(@Ctx() context: AuthorizedContext) {
        return await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });
    }

}
