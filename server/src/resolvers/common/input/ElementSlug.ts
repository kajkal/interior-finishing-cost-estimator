import { ArgsType, Field } from 'type-graphql';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ElementSlug {

    @Field()
    @IsSlug()
    slug!: string;

}
