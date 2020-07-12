import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, IdentifiedReference, ManyToOne, Property } from 'mikro-orm';

import { BaseEntity } from '../BaseEntity';
import { User } from '../user/User';


@ObjectType()
@Entity({ tableName: 'projects' })
export class Project extends BaseEntity {

    @Field(() => ID)
    id!: string;

    @ManyToOne()
    user!: IdentifiedReference<User>;

    @Field()
    @Property()
    name!: string;

    @Field({ description: 'Unique project slug. Used in URLs' })
    @Property({ unique: true })
    slug!: string;

}
