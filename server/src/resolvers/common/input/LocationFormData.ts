import { Field, InputType } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';


@InputType()
export class LocationFormData {

    @Field()
    @IsNotEmpty()
    placeId!: string;

    @Field()
    @IsNotEmpty()
    main!: string;

    @Field()
    @IsNotEmpty()
    secondary!: string;

}
