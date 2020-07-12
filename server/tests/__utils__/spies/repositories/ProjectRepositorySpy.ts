import { ProjectRepository } from '../../../../src/repositories/ProjectRepository';


export class ProjectRepositorySpy {

    static create: jest.SpiedFunction<typeof ProjectRepository.prototype.create>;
    static persistAndFlush: jest.SpiedFunction<typeof ProjectRepository.prototype.persistAndFlush>;
    static find: jest.SpiedFunction<typeof ProjectRepository.prototype.find>;

    static setupSpies() {
        this.restoreSpies();
        this.create = jest.spyOn(ProjectRepository.prototype, 'create');
        this.persistAndFlush = jest.spyOn(ProjectRepository.prototype, 'persistAndFlush');
        this.find = jest.spyOn(ProjectRepository.prototype, 'find');
    }

    private static restoreSpies() {
        this.create?.mockRestore();
        this.persistAndFlush?.mockRestore();
        this.find?.mockRestore();
    }

}
