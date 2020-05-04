import { DateTime } from 'luxon';
import { Field, ID, ObjectType } from 'type-graphql';
import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';


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

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: DateTime;

    @UpdateDateColumn({ type: 'timestamp', nullable: true  })
    updatedAt?: DateTime

}
