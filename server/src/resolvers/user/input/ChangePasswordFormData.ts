import { ArgsType, Field } from 'type-graphql';
import { Length } from 'class-validator';


@ArgsType()
export class ChangePasswordFormData {

    @Field()
    @Length(6, 255)
    currentPassword!: string;

    @Field()
    @Length(6, 255)
    newPassword!: string;

}
