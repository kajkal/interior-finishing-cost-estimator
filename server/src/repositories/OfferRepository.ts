import { EntityRepository, Repository } from 'mikro-orm';

import { Offer } from '../entities/offer/Offer';


@Repository(Offer)
export class OfferRepository extends EntityRepository<Offer> {

}
