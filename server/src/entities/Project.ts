import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';


@ObjectType()
@Entity('projects')
export class Project {

    @Field(() => ID)
    @ObjectIdColumn()
    id!: ObjectID;

    @Field()
    @Column()
    name!: string;

}
