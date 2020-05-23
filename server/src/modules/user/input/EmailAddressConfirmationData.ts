import { Field, InputType } from 'type-graphql';
import { IsJWT } from 'class-validator';


@InputType()
export class EmailAddressConfirmationData {

    @Field({ description: 'Email address confirmation token sent by email' })
    @IsJWT()
    token!: string;

}
