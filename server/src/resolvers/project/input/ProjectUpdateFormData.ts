import { ArgsType, Field } from 'type-graphql';
import { Length } from 'class-validator';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ProjectUpdateFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

    @Field()
    @Length(3, 64)
    name!: string;

}
