import { Field, Float, InputType } from 'type-graphql';
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

    @Field(() => Float, { nullable: true })
    lat?: number | null;

    @Field(() => Float, { nullable: true })
    lng?: number | null;

}
