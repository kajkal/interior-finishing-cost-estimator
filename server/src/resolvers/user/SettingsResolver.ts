import { Inject, Service } from 'typedi';
import { hash, verify } from 'argon2';
import { UserInputError } from 'apollo-server-express';
import { Args, Authorized, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';

import { ChangeProfileSettingsFormData } from './input/ChangeProfileSettingsFormData';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { ChangePasswordFormData } from './input/ChangePasswordFormData';
import { UserRepository } from '../../repositories/UserRepository';
import { ChangeEmailFormData } from './input/ChangeEmailFormData';
import { EmailService } from '../../services/email/EmailService';
import { logAccess } from '../../utils/logAccess';


@Service()
@Resolver()
export class SettingsResolver {

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly emailService!: EmailService;


    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async changeEmail(@Args() { email: newEmail }: ChangeEmailFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const user = await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });

        if (user.email !== newEmail) {
            if (await this.userRepository.isEmailTaken(newEmail)) {
                throw new UserInputError('EMAIL_NOT_AVAILABLE');
            }
            user.email = newEmail;
            user.isEmailAddressConfirmed = false;
            this.emailService.sendConfirmEmailAddressEmail(user); // no need to await
            await this.userRepository.persistAndFlush(user);
        }

        return true;
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async changePassword(@Args() { currentPassword, newPassword }: ChangePasswordFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const user = await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });

        const isPasswordCorrect = await verify(user.password, currentPassword);
        if (isPasswordCorrect) {
            user.password = await hash(newPassword);
            await this.userRepository.persistAndFlush(user);
            return true;
        }

        throw new UserInputError('INVALID_CURRENT_PASSWORD');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async changeProfileSettings(@Args() { hidden }: ChangeProfileSettingsFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const user = await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });

        if (user.isEmailAddressConfirmed !== hidden) {
            user.hidden = hidden;
            await this.userRepository.persistAndFlush(user);
        }

        return true;
    }

}
