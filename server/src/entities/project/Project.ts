import { Field, ObjectType } from 'type-graphql';
import { Entity, IdentifiedReference, ManyToOne, Property } from 'mikro-orm';

import { BaseEntity } from '../BaseEntity';
import { User } from '../user/User';
import { Location } from './Location';


@ObjectType()
@Entity({ tableName: 'projects' })
export class Project extends BaseEntity {

    @Field({ description: 'Unique project slug. Used in URLs' })
    @Property({ unique: true })
    slug!: string;

    @ManyToOne()
    user!: IdentifiedReference<User>;

    @Field()
    @Property()
    name!: string;

    @Field(() => Location, { nullable: true })
    @Property()
    location?: Location | null;

}
