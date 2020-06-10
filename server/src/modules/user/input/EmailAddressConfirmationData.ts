import { ArgsType, Field } from 'type-graphql';
import { IsJWT } from 'class-validator';


@ArgsType()
export class EmailAddressConfirmationData {

    @Field({ description: 'Email address confirmation token sent by email' })
    @IsJWT()
    token!: string;

}
