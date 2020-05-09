import { OfferRepository } from '../../../src/repositories/OfferRepository';


export class OfferRepositorySpiesManager {

    static create: jest.SpiedFunction<typeof OfferRepository.prototype.create>;
    static persistAndFlush: jest.SpiedFunction<typeof OfferRepository.prototype.persistAndFlush>;

    static setupSpies() {
        this.restoreSpies();
        this.create = jest.spyOn(OfferRepository.prototype, 'create');
        this.persistAndFlush = jest.spyOn(OfferRepository.prototype, 'persistAndFlush');
    }

    private static restoreSpies() {
        this.create?.mockRestore();
        this.persistAndFlush?.mockRestore();
    }

}
