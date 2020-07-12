import { generateSlugBase, generateUniqueSlug } from '../../../src/utils/generateUniqueSlug';


describe('generateUniqueSlug file', () => {

    describe('generateSlugBase function', () => {

        it('should generate slug based on provided string', () => {
            const slug = generateSlugBase(' ://sample RaNdOm, Slug. ');
            expect(slug).toBe('sample-random-slug');
        });

    });

    describe('generateUniqueSlug function', () => {

        it('should return slugBase when there are no similar slugs taken', () => {
            const slug = generateUniqueSlug('sample', []);
            expect(slug).toBe('sample');
        });

        it('should return slugBase when slugBase is not taken', () => {
            const slug = generateUniqueSlug('sample', [ 'sample-1' ]);
            expect(slug).toBe('sample');
        });

        it('should return unique slug when slugBase is already taken', () => {
            const slug = generateUniqueSlug('sample', [ 'sample' ]);
            expect(slug).toBe('sample-1');
        });

        it('should return unique slug with minimal available numeric suffix', () => {
            const slug = generateUniqueSlug('sample', [ 'sample', 'sample-3', 'sample-1' ]);
            expect(slug).toBe('sample-2');
        });

        it('should return unique slug with numeric suffix', () => {
            const slug = generateUniqueSlug('sample', [ 'sample', 'sample-2', 'sample-1' ]);
            expect(slug).toBe('sample-3');
        });

    });

});
