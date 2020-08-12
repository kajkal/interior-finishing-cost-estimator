import { Field, ObjectType } from 'type-graphql';
import { Location } from '../../../entities/common/Location';


@ObjectType()
export class Profile {

    @Field()
    userSlug!: string;

    @Field()
    name!: string;

    @Field(() => String, { nullable: true })
    avatar?: string | null;

    @Field(() => String, { nullable: true, description: 'Serialized user profile' })
    description?: string | null;

    @Field(() => Location, { nullable: true })
    location?: Location | null;

}
