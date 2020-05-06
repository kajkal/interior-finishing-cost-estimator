import { ObjectID } from 'mongodb';
import { MongoEntity, PrimaryKey, Property, SerializedPrimaryKey } from 'mikro-orm';


export abstract class BaseEntity implements MongoEntity<BaseEntity> {

    @PrimaryKey()
    _id!: ObjectID;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt?: Date;

}
