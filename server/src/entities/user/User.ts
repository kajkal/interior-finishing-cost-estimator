import { Field, ObjectType } from 'type-graphql';
import { Collection, Entity, OneToMany, Property, wrap } from 'mikro-orm';

import { BaseEntity } from '../BaseEntity';
import { Product } from '../product/Product';
import { Project } from '../project/Project';
import { Offer } from '../offer/Offer';


@ObjectType()
@Entity({ tableName: 'users' })
export class User extends BaseEntity {

    @Field()
    @Property()
    name!: string;

    @Field()
    @Property({ unique: true })
    email!: string;

    @Property()
    password!: string;

    /**
     * @see UserResolver#products
     */
    @OneToMany(() => Product, 'user')
    products = new Collection<Product>(this);

    /**
     * @see UserResolver#projects
     */
    @OneToMany(() => Project, 'user')
    projects = new Collection<Project>(this);

    /**
     * @see UserResolver#offers
     */
    @OneToMany(() => Offer, 'user')
    offers = new Collection<Offer>(this);

}
