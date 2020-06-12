import { ArgsType, Field } from 'type-graphql';
import { IsEmail } from 'class-validator';


@ArgsType()
export class PasswordResetRequestFormData {

    @Field({ description: 'Email with reset instructions will be send to this email address.' })
    @IsEmail()
    email!: string;

}
