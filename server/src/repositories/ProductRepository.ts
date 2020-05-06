import { EntityRepository, Repository } from 'mikro-orm';

import { Product } from '../entities/product/Product';


@Repository(Product)
export class ProductRepository extends EntityRepository<Product> {

}
