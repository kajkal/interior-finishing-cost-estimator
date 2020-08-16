import { Field, ObjectType } from 'type-graphql';


@ObjectType()
export class Author {

    @Field()
    userSlug!: string;

    @Field()
    name!: string;

    @Field(() => String, { nullable: true })
    avatar?: string | null;

}
