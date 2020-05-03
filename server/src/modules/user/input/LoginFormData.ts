import { Field, InputType } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';


@InputType()
export class LoginFormData {

    @Field()
    @IsEmail()
    email!: string;

    @Field()
    @Length(6, 255)
    password!: string;

}
