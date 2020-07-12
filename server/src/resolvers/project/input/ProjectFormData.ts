import { ArgsType, Field } from 'type-graphql';
import { IsMongoId, IsOptional, Length } from 'class-validator';


@ArgsType()
export class ProjectFormData {

    @Field({ nullable: true })
    @IsOptional()
    @IsMongoId()
    id?: string;

    @Field()
    @Length(3, 64)
    name!: string;

}
