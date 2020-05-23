import { Inject, Service } from 'typedi';
import { hash, verify } from 'argon2';
import { UserInputError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { EmailAddressConfirmationData } from './input/EmailAddressConfirmationData';
import { AccountService } from '../../services/AccountService';
import { RegisterFormData } from './input/RegisterFormData';
import { EmailService } from '../../services/EmailService';
import { AuthService } from '../../services/AuthService';
import { LoginFormData } from './input/LoginFormData';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/user/User';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { UserRepository } from '../../repositories/UserRepository';
import { Product } from '../../entities/product/Product';
import { Project } from '../../entities/project/Project';
import { Offer } from '../../entities/offer/Offer';
import { InitialData } from './output/InitialData';


@Service()
@Resolver(() => User)
export class UserResolver {

    @Inject()
    private readonly authService!: AuthService;

    @Inject()
    private readonly emailService!: EmailService;

    @Inject()
    private readonly accountService!: AccountService;

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
        return await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });
    }

    @UseMiddleware(logAccess)
    @Mutation(() => InitialData)
    async register(@Arg('data') data: RegisterFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
        if (await this.userRepository.isEmailTaken(data.email)) {
            throw new UserInputError('EMAIL_NOT_AVAILABLE');
        }

        const encodedPassword = await hash(data.password);

        const user = this.userRepository.create({ ...data, password: encodedPassword });
        await this.userRepository.persistAndFlush(user);

        this.emailService.sendConfirmEmailAddressEmail(user); // no need to await

        this.authService.generateRefreshToken(context.res, user);
        const accessToken = this.authService.generateAccessToken(user);

        return { user, accessToken };
    }

    @UseMiddleware(logAccess)
    @Mutation(() => InitialData)
    async login(@Arg('data') data: LoginFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
        const user = await this.userRepository.findOne({ email: data.email });

        if (user) {
            const isPasswordCorrect = await verify(user.password, data.password);
            if (isPasswordCorrect) {
                this.authService.generateRefreshToken(context.res, user);
                const accessToken = this.authService.generateAccessToken(user);

                return { user, accessToken };
            }
        }

        throw new UserInputError('BAD_CREDENTIALS');
    }

    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async logout(@Ctx() context: ExpressContext): Promise<boolean> {
        this.authService.invalidateRefreshToken(context.res);
        return true;
    }

    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async confirmEmailAddress(@Arg('data') data: EmailAddressConfirmationData): Promise<boolean> {
        try {
            const { sub } = this.accountService.verifyEmailAddressConfirmationToken(data.token);
            const user = await this.userRepository.findOneOrFail({ id: sub });
            user.isEmailAddressConfirmed = true;
            await this.userRepository.persistAndFlush(user);
            return true;
        } catch (error) {
            throw new UserInputError('INVALID_EMAIL_ADDRESS_CONFIRMATION_TOKEN');
        }
    }

}
