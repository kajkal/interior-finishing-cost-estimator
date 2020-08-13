import { ArgsType, Field } from 'type-graphql';


@ArgsType()
export class ChangeProfileSettingsFormData {

    @Field()
    hidden!: boolean;

}
