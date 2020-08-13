import { Field, ObjectType } from 'type-graphql';
import { Collection, Entity, OneToMany, Property } from 'mikro-orm';

import { BaseEntity } from '../BaseEntity';
import { Product } from '../product/Product';
import { Project } from '../project/Project';
import { Offer } from '../offer/Offer';
import { Location } from '../common/Location';


@ObjectType()
@Entity({ tableName: 'users' })
export class User extends BaseEntity {


    /**
     * --------------------------------------------------
     * Settings/Meta
     * --------------------------------------------------
     */

    @Field()
    @Property({ unique: true })
    email!: string;

    @Property()
    password!: string;

    /**
     * Indicates whether the user has confirmed that the given email address is his.
     */
    @Field({ nullable: true })
    @Property()
    isEmailAddressConfirmed: boolean = false;

    /**
     * Indicates whether the user has publicly available profile.
     * When hidden is set to true - user' profile become private - not accessible for any other user.
     */
    @Property()
    hidden: boolean = false;


    /**
     * --------------------------------------------------
     * Profile
     * --------------------------------------------------
     */

    @Field()
    @Property()
    name!: string;

    @Field({ description: 'Unique user slug. Used in URLs' })
    @Property({ unique: true })
    slug!: string;

    @Property()
    profileDescription?: string | null;

    @Property()
    location?: Location | null;


    /**
     * --------------------------------------------------
     * Relations
     * --------------------------------------------------
     */

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
