import { hash } from 'argon2';
import { Inject, Service } from 'typedi';
import { Args, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { UserInputError } from 'apollo-server-express';

import { EmailAddressConfirmationService } from '../../services/email-address-confirmation/EmailAddressConfirmationService';
import { EmailAddressConfirmationData } from './input/EmailAddressConfirmationData';
import { UserRepository } from '../../repositories/UserRepository';
import { EmailService } from '../../services/email/EmailService';
import { AuthService } from '../../services/auth/AuthService';
import { RegisterFormData } from './input/RegisterFormData';
import { InitialData } from './output/InitialData';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/user/User';


@Service()
@Resolver()
export class RegisterResolver {

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly authService!: AuthService;

    @Inject()
    private readonly emailService!: EmailService;

    @Inject()
    private readonly emailAddressConfirmationService!: EmailAddressConfirmationService;


    @UseMiddleware(logAccess)
    @Mutation(() => InitialData, { description: 'Registers and additionally authenticates new user.' })
    async register(@Args() data: RegisterFormData, @Ctx() context: ExpressContext): Promise<InitialData> {
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
    @Mutation(() => Boolean, { description: 'Registration second step - confirms that the user is owner of the provided email address.' })
    async confirmEmailAddress(@Args() data: EmailAddressConfirmationData): Promise<boolean> {
        let user: User | undefined;

        try {
            const { sub } = this.emailAddressConfirmationService.verifyEmailAddressConfirmationToken(data.token);
            user = await this.userRepository.findOneOrFail({ id: sub });
        } catch (error) {
            throw new UserInputError('INVALID_EMAIL_ADDRESS_CONFIRMATION_TOKEN');
        }

        if (user.isEmailAddressConfirmed) {
            throw new UserInputError('EMAIL_ADDRESS_ALREADY_CONFIRMED');
        }

        user.isEmailAddressConfirmed = true;
        await this.userRepository.persistAndFlush(user);
        return true;
    }

}
