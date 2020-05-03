import { Field, ObjectType } from 'type-graphql';


@ObjectType({
    description: 'User specific, application initial data.',
})
export class InitialData {

    @Field(() => [String])
    projects!: string[]; // todo

}
