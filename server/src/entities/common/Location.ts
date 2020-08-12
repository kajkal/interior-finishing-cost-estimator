import { Field, ObjectType } from 'type-graphql';
import { Property } from 'mikro-orm';


@ObjectType({
    description: 'Data extracted from place object https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#library_5',
})
export class Location {

    @Field()
    @Property()
    placeId!: string;

    @Field()
    @Property()
    main!: string;

    @Field()
    @Property()
    secondary!: string;

}
