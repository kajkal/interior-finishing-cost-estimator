import { hash, verify } from 'argon2';
import { UserInputError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { RegisterFormData } from './input/RegisterFormData';
import { InitialData } from '../common/output/InitialData';
import { JwtService } from '../../services/JwtService';
import { LoginFormData } from './input/LoginFormData';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/User';


@Resolver()
export class UserResolver {

    @UseMiddleware(logAccess)
    @Query(() => [ User ])
    async users() {
        return User.find();
    }

    @UseMiddleware(logAccess)
    @Mutation(() => InitialData)
    async register(@Arg('data') data: RegisterFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
        const encodedPassword = await hash(data.password);

        const createdUser = await User.create({
            ...data,
            password: encodedPassword,
            createdAt: new Date().toISOString(),
        }).save();

        JwtService.generate(context, createdUser);

        return {
            projects: [], // todo find user projects
        };
    }

    @UseMiddleware(logAccess)
    @Mutation(() => InitialData)
    async login(@Arg('data') data: LoginFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
        const user = await User.findOne({ email: data.email });

        if (user) {
            const isPasswordCorrect = await verify(user.password, data.password);
            if (isPasswordCorrect) {
                JwtService.generate(context, user);

                return {
                    projects: [], // todo find user projects
                };
            }
        }

        throw new UserInputError('BAD_CREDENTIALS');
    }

    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async logout(@Ctx() context: ExpressContext): Promise<boolean> {
        JwtService.invalidate(context);
        return true;
    }

}
