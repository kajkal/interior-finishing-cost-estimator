import { ProductRepository } from '../../../src/repositories/ProductRepository';


export class ProductRepositorySpiesManager {

    static create: jest.SpiedFunction<typeof ProductRepository.prototype.create>;
    static persistAndFlush: jest.SpiedFunction<typeof ProductRepository.prototype.persistAndFlush>;

    static setupSpies() {
        this.restoreSpies();
        this.create = jest.spyOn(ProductRepository.prototype, 'create');
        this.persistAndFlush = jest.spyOn(ProductRepository.prototype, 'persistAndFlush');
    }

    private static restoreSpies() {
        this.create?.mockRestore();
        this.persistAndFlush?.mockRestore();
    }

}
