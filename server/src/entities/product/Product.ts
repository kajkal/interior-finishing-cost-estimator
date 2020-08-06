import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, IdentifiedReference, ManyToOne, Property } from 'mikro-orm';

import { CurrencyAmount } from './CurrencyAmount';
import { BaseEntity } from '../BaseEntity';
import { User } from '../user/User';


@ObjectType()
@Entity({ tableName: 'products' })
export class Product extends BaseEntity {

    @Field(() => ID)
    id!: string;

    @ManyToOne()
    user!: IdentifiedReference<User>;

    @Field()
    @Property()
    name!: string;

    @Field()
    @Property()
    description!: string;

    @Field(() => CurrencyAmount, { nullable: true })
    @Property()
    price?: CurrencyAmount | null;

    @Field(() => [ String ], { nullable: true })
    @Property()
    tags?: string[] | null;

}
