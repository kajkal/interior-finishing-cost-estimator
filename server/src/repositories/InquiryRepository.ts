import { EntityRepository, Repository } from 'mikro-orm';

import { Inquiry } from '../entities/inquiry/Inquiry';


@Repository(Inquiry)
export class InquiryRepository extends EntityRepository<Inquiry> {

}
