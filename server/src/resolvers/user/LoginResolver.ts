import { verify } from 'argon2';
import { Inject, Service } from 'typedi';
import { Args, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { UserInputError } from 'apollo-server-express';

import { UserRepository } from '../../repositories/UserRepository';
import { AuthService } from '../../services/auth/AuthService';
import { LoginFormData } from './input/LoginFormData';
import { InitialData } from './output/InitialData';
import { logAccess } from '../../utils/logAccess';


@Service()
@Resolver()
export class LoginResolver {

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly authService!: AuthService;


    @UseMiddleware(logAccess)
    @Mutation(() => InitialData, { description: 'Authenticates user.' })
    async login(@Args() data: LoginFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
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
    @Mutation(() => Boolean, { description: 'Invalidates user session.' })
    async logout(@Ctx() context: ExpressContext): Promise<boolean> {
        this.authService.invalidateRefreshToken(context.res);
        return true;
    }

}
