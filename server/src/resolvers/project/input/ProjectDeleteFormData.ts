import { ArgsType, Field } from 'type-graphql';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ProjectDeleteFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

}
