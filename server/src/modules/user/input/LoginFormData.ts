import { ArgsType, Field } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';


@ArgsType()
export class LoginFormData {

    @Field()
    @IsEmail()
    email!: string;

    @Field()
    @Length(6, 255)
    password!: string;

}
