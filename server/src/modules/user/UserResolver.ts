import { Inject, Service } from 'typedi';
import { hash, verify } from 'argon2';
import { UserInputError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { RegisterFormData } from './input/RegisterFormData';
import { JwtService } from '../../services/JwtService';
import { LoginFormData } from './input/LoginFormData';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/user/User';
import { AuthorizedContext } from '../../utils/authChecker';
import { UserRepository } from '../../repositories/UserRepository';
import { Product } from '../../entities/product/Product';
import { Project } from '../../entities/project/Project';
import { Offer } from '../../entities/offer/Offer';


@Service()
@Resolver(() => User)
export class UserResolver {

    @Inject()
    private readonly jwtService!: JwtService;

    @Inject()
    private readonly userRepository!: UserRepository;


    @FieldResolver(() => [ Product ])
    async products(@Root() user: User) {
        console.log('loading products for user', user.email);
        return await user.products.loadItems();
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
    @Query(() => User, { description: 'Data of the currently authenticated user' })
    async me(@Ctx() context: AuthorizedContext) {
        return await this.userRepository.findOneOrFail({ id: context.jwtPayload.userId });
    }

    @UseMiddleware(logAccess)
    @Mutation(() => User)
    async register(@Arg('data') data: RegisterFormData, @Ctx() context: ExpressContext): Promise<User> {
        if (await this.userRepository.isEmailTaken(data.email)) {
            throw new UserInputError('EMAIL_NOT_AVAILABLE');
        }

        const encodedPassword = await hash(data.password);

        const userToSave = this.userRepository.create({ ...data, password: encodedPassword });
        await this.userRepository.persistAndFlush(userToSave);

        this.jwtService.generate(context, userToSave);

        return userToSave;
    }

    @UseMiddleware(logAccess)
    @Mutation(() => User)
    async login(@Arg('data') data: LoginFormData, @Ctx() context: ExpressContext): Promise<User> {
        const user = await this.userRepository.findOne({ email: data.email });

        if (user) {
            const isPasswordCorrect = await verify(user.password, data.password);
            if (isPasswordCorrect) {
                this.jwtService.generate(context, user);
                return user;
            }
        }

        throw new UserInputError('BAD_CREDENTIALS');
    }

    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async logout(@Ctx() context: ExpressContext): Promise<boolean> {
        this.jwtService.invalidate(context);
        return true;
    }

}
