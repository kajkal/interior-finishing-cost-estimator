import { ArgsType, Field } from 'type-graphql';

import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class RoomDeleteFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

    @Field()
    @IsSlug()
    roomId!: string;

}
