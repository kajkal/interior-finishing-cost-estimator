import { ArgsType, Field } from 'type-graphql';
import { IsJWT, Length } from 'class-validator';


@ArgsType()
export class PasswordResetFormData {

    @Field({ description: 'Password reset token sent by email.' })
    @IsJWT()
    token!: string;

    @Field({ description: 'Account new password.' })
    @Length(6, 255)
    password!: string;

}
