import { ArgsType, Field } from 'type-graphql';
import { IsMongoId, Length } from 'class-validator';


@ArgsType()
export class ProjectUpdateFormData {

    @Field()
    @IsMongoId()
    projectId!: string;

    @Field()
    @Length(3, 64)
    name!: string;

}
