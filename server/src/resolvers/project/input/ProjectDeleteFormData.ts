import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@ArgsType()
export class ProjectDeleteFormData {

    @Field()
    @IsMongoId()
    projectId!: string;

}
