import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';


@ObjectType()
@Entity('users')
export class User {

    @Field(() => ID)
    @ObjectIdColumn()
    id!: ObjectID;

    @Field()
    @Column()
    name!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    createdAt!: string;

}
