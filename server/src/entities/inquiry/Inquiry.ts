import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, IdentifiedReference, ManyToOne, Property } from 'mikro-orm';

import { Location } from '../common/Location';
import { BaseEntity } from '../BaseEntity';
import { Category } from './Category';
import { User } from '../user/User';
import { Quote } from './Quote';


@ObjectType()
@Entity({ tableName: 'inquiries' })
export class Inquiry extends BaseEntity {

    @Field(() => ID)
    id!: string;

    @ManyToOne()
    user!: IdentifiedReference<User>;

    @Field()
    @Property()
    title!: string;

    @Field({ description: 'Serialized description' })
    @Property()
    description!: string;

    @Field(() => Location)
    @Property()
    location!: Location;

    @Field(() => Category)
    @Property()
    category!: Category;

    /**
     * @see InquiryResolver#quotes
     */
    @Property()
    quotes?: Quote[] | null

}
