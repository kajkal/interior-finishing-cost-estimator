import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@ArgsType()
export class ElementId {

    @Field()
    @IsMongoId()
    id!: string;

}
