import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';


@ObjectType()
@Entity('offers')
export class Offer {

    @Field(() => ID)
    @ObjectIdColumn()
    id!: ObjectID;

    @Field()
    @Column()
    title!: string;

}
