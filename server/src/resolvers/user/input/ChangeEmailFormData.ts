import { ArgsType, Field } from 'type-graphql';
import { IsEmail } from 'class-validator';


@ArgsType()
export class ChangeEmailFormData {

    @Field()
    @IsEmail()
    email!: string;

}
