import { Field, InputType } from 'type-graphql';
import { Length } from 'class-validator';
import { LoginFormData } from './LoginFormData';


@InputType()
export class RegisterFormData extends LoginFormData {

    @Field()
    @Length(3, 255)
    name!: string;

}
