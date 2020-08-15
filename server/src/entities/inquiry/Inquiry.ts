import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, IdentifiedReference, ManyToOne, Property } from 'mikro-orm';

import { BaseEntity } from '../BaseEntity';
import { Category } from './Category';
import { User } from '../user/User';


@ObjectType()
@Entity({ tableName: 'inquiries' })
export class Inquiry extends BaseEntity {

    @Field(() => ID)
    id!: string;

    @ManyToOne()
    user!: IdentifiedReference<User>;

    @Field()
    @Property()
    name!: string;

    @Field(() => Category)
    @Property()
    category!: Category;

}
