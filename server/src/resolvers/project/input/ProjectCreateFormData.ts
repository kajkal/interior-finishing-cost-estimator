import { ArgsType, Field } from 'type-graphql';
import { Length } from 'class-validator';


@ArgsType()
export class ProjectCreateFormData {

    @Field()
    @Length(3, 64)
    name!: string;

}
