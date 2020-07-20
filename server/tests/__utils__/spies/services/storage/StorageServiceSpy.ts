import { StorageService } from '../../../../../src/services/storage/StorageService';


export class StorageServiceSpy {

    static uploadResource: jest.SpiedFunction<typeof StorageService.prototype.uploadResource>;
    static getResources: jest.SpiedFunction<typeof StorageService.prototype.getResources>;
    static deleteResources: jest.SpiedFunction<typeof StorageService.prototype.deleteResources>;

    static setupSpies() {
        this.restoreSpies();
        this.uploadResource = jest.spyOn(StorageService.prototype, 'uploadResource');
        this.getResources = jest.spyOn(StorageService.prototype, 'getResources');
        this.deleteResources = jest.spyOn(StorageService.prototype, 'deleteResources');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.uploadResource.mockImplementation();
        this.getResources.mockImplementation();
        this.deleteResources.mockImplementation();
    }

    private static restoreSpies() {
        this.uploadResource?.mockRestore();
        this.getResources?.mockRestore();
        this.deleteResources?.mockRestore();
    }

}
