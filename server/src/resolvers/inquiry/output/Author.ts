import { Field, ObjectType } from 'type-graphql';


@ObjectType({ description: 'Wrapper for resource file data.' })
export class Author {

    @Field()
    userSlug!: string;

    @Field()
    name!: string;

    @Field(() => String, { nullable: true })
    avatar?: string | null;

}
