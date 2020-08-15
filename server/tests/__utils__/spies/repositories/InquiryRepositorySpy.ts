import { InquiryRepository } from '../../../../src/repositories/InquiryRepository';


export class InquiryRepositorySpy {

    static create: jest.SpiedFunction<typeof InquiryRepository.prototype.create>;
    static persistAndFlush: jest.SpiedFunction<typeof InquiryRepository.prototype.persistAndFlush>;

    static setupSpies() {
        this.restoreSpies();
        this.create = jest.spyOn(InquiryRepository.prototype, 'create');
        this.persistAndFlush = jest.spyOn(InquiryRepository.prototype, 'persistAndFlush');
    }

    private static restoreSpies() {
        this.create?.mockRestore();
        this.persistAndFlush?.mockRestore();
    }

}
