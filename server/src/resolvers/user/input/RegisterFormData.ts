import { ArgsType, Field } from 'type-graphql';
import { Length } from 'class-validator';
import { LoginFormData } from './LoginFormData';


@ArgsType()
export class RegisterFormData extends LoginFormData {

    @Field()
    @Length(3, 255)
    name!: string;

}
