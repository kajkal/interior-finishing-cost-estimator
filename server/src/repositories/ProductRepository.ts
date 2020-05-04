import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';

import { Product } from '../entities/Product';


@Service()
@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {

}
