import { EntityManager } from 'mikro-orm';

import { ProjectRepositorySpy } from '../../__utils__/spies/repositories/ProjectRepositorySpy';

import { ProjectRepository } from '../../../src/repositories/ProjectRepository';
import { Project } from '../../../src/entities/project/Project';


describe('ProjectRepository class', () => {

    const repositoryUnderTest = new ProjectRepository({} as EntityManager, Project);

    beforeEach(() => {
        ProjectRepositorySpy.setupSpies();
    });

    describe('generateUniqueSlug method', () => {

        const slugsFromDb = [
            'apartment-renovation-2',
            'apartment-renovation',
            'sample-1',
        ];

        beforeEach(() => {
            ProjectRepositorySpy.find.mockImplementation(({ slug: slugRegExp }: any): any => slugsFromDb
                .filter(slug => slugRegExp.test(slug))
                .map(slug => ({ slug })),
            );
        });

        it('should generate slug when there are no similar slugs in db', async () => {
            const result = await repositoryUnderTest.generateUniqueSlug('Renovation.');
            expect(result).toBe('renovation');
        });

        it('should generate unique slug when there are similar slugs in db', async () => {
            const result1 = await repositoryUnderTest.generateUniqueSlug('Apartment renovation');
            expect(result1).toBe('apartment-renovation-1');

            const result2 = await repositoryUnderTest.generateUniqueSlug('Sample');
            expect(result2).toBe('sample');
        });

    });

});
