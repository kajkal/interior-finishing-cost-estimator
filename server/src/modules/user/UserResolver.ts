import { Inject, Service } from 'typedi';
import { hash, verify } from 'argon2';
import { UserInputError } from 'apollo-server-express';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { RegisterFormData } from './input/RegisterFormData';
import { InitialData } from '../common/output/InitialData';
import { JwtService } from '../../services/JwtService';
import { LoginFormData } from './input/LoginFormData';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/User';
import { AuthorizedContext } from '../../utils/authChecker';
import { UserRepository } from '../../repositories/UserRepository';


@Service()
@Resolver()
export class UserResolver {

    @Inject()
    private readonly jwtService!: JwtService;

    @InjectRepository()
    private readonly userRepository!: UserRepository;

    @UseMiddleware(logAccess)
    @Query(() => [ User ])
    async users() {
        return this.userRepository.find();
    }

    @UseMiddleware(logAccess)
    @Mutation(() => InitialData)
    async register(@Arg('data') data: RegisterFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
        if (await this.userRepository.isEmailTaken(data.email)) {
            throw new UserInputError('EMAIL_NOT_AVAILABLE');
        }

        const encodedPassword = await hash(data.password);

        const userToBeSaved = this.userRepository.create({
            ...data,
            password: encodedPassword,
            // createdAt: new Date().toISOString(),
        });
        const savedUser = await this.userRepository.save(userToBeSaved);

        this.jwtService.generate(context, savedUser);

        return {
            projects: [], // todo find user projects
        };
    }

    @UseMiddleware(logAccess)
    @Mutation(() => InitialData)
    async login(@Arg('data') data: LoginFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
        const user = await this.userRepository.findOne({ email: data.email });

        if (user) {
            const isPasswordCorrect = await verify(user.password, data.password);
            if (isPasswordCorrect) {
                this.jwtService.generate(context, user);

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
        this.jwtService.invalidate(context);
        return true;
    }

}
