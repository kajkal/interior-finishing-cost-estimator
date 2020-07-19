import { Field, ObjectType } from 'type-graphql';


@ObjectType({ description: 'Wrapper for resource file data.' })
export class ResourceData {

    @Field()
    url!: string;

    @Field({ nullable: true })
    description?: string;

}
