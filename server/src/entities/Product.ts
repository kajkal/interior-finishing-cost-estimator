import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';


@ObjectType()
@Entity('products')
export class Product {

    @Field(() => ID)
    @ObjectIdColumn()
    id!: ObjectID;

    @Field()
    @Column()
    name!: string;

}
