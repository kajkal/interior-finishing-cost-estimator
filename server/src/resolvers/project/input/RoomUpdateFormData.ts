import { ArgsType, Field } from 'type-graphql';

import { RoomCreateFormData } from './RoomCreateFormData';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class RoomUpdateFormData extends RoomCreateFormData {

    @Field()
    @IsSlug()
    roomId!: string;

}
