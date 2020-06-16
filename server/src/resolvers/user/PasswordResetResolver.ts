import { hash } from 'argon2';
import { Inject, Service } from 'typedi';
import { TokenExpiredError } from 'jsonwebtoken';
import { Args, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { UserInputError } from 'apollo-server-express';

import { PasswordResetService } from '../../services/password-reset/PasswordResetService';
import { PasswordResetRequestFormData } from './input/PasswordResetRequestFormData';
import { PasswordResetFormData } from './input/PasswordResetFormData';
import { UserRepository } from '../../repositories/UserRepository';
import { EmailService } from '../../services/email/EmailService';
import { logAccess } from '../../utils/logAccess';
import { User } from '../../entities/user/User';
import { logger } from '../../utils/logger';


@Service()
@Resolver()
export class PasswordResetResolver {

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly emailService!: EmailService;

    @Inject()
    private readonly passwordResetService!: PasswordResetService;


    @UseMiddleware(logAccess)
    @Mutation(() => Boolean, { description: 'Sends password reset instructions to given email address.' })
    async sendPasswordResetInstructions(@Args() args: PasswordResetRequestFormData): Promise<boolean> {
        const user = await this.userRepository.findOne({ email: args.email });

        if (user && user.isEmailAddressConfirmed) {
            await this.emailService.sendPasswordResetInstructionsEmail(user);
        } else {
            logger.warn('cannot send reset password instructions', {
                email: args.email,
                isRegistered: Boolean(user),
                isEmailAddressConfirmed: user?.isEmailAddressConfirmed,
            });
        }

        return true;
    }

    @UseMiddleware(logAccess)
    @Mutation(() => Boolean, { description: 'Based on token from email, changes user password.' })
    async resetPassword(@Args() args: PasswordResetFormData): Promise<boolean> {
        let user: User | undefined;

        try {
            const { sub } = this.passwordResetService.verifyPasswordResetToken(args.token);
            user = await this.userRepository.findOneOrFail({ id: sub });
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UserInputError('EXPIRED_PASSWORD_RESET_TOKEN', { expiredAt: error.expiredAt });
            }
            throw new UserInputError('INVALID_PASSWORD_RESET_TOKEN');
        }

        user.password = await hash(args.password);
        await this.userRepository.persistAndFlush(user);

        return true;
    }

}
