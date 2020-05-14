import { Field, ObjectType } from 'type-graphql';
import { User } from '../../../entities/user/User';


@ObjectType({ description: 'Data returned after successful login or registration' })
export class InitialData {

    @Field()
    user!: User;

    @Field()
    accessToken!: string;

}
