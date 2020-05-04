import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';

import { Offer } from '../entities/Offer';


@Service()
@EntityRepository(Offer)
export class OfferRepository extends Repository<Offer> {

}
