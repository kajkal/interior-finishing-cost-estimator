import { ProjectRepository } from '../../../../src/repositories/ProjectRepository';


export class ProjectRepositorySpy {

    static create: jest.SpiedFunction<typeof ProjectRepository.prototype.create>;
    static persistAndFlush: jest.SpiedFunction<typeof ProjectRepository.prototype.persistAndFlush>;

    static setupSpies() {
        this.restoreSpies();
        this.create = jest.spyOn(ProjectRepository.prototype, 'create');
        this.persistAndFlush = jest.spyOn(ProjectRepository.prototype, 'persistAndFlush');
    }

    private static restoreSpies() {
        this.create?.mockRestore();
        this.persistAndFlush?.mockRestore();
    }

}
