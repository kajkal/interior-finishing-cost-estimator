import { Field, InputType } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';
import { IsEmailAvailable } from '../validators/IsEmailAvailable';


@InputType()
export class RegisterFormData {

    @Field()
    @Length(3, 255)
    name!: string;

    @Field()
    @IsEmail()
    @IsEmailAvailable()
    email!: string;

    @Field()
    @Length(6, 255)
    password!: string;

}
