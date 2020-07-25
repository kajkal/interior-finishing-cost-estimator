import 'reflect-metadata';

import { expectValidationErrors } from '../../__utils__/validation-utils/validationUtils';

import { IsSlug } from '../../../src/decorators/IsSlug';


describe('IsSlug decorator', () => {

    class SampleClass {

        @IsSlug()
        slug!: string;

        constructor(slug: any) {
            this.slug = slug;
        }

    }

    it('should validate object property decorated with IsSlug decorator', () => {
        const validSlugs = [
            'slug',
            'valid-slug',
            'valid-slug-1',
        ];
        validSlugs.forEach((slug) => {
            expectValidationErrors(new SampleClass(slug), []);
        });

        const invalidSlugs = [
            '_not-slug',
            '-not-slug',
            'not-slug-',
            'not slug',
            '@#_$@',
            null,
            undefined,
            4,
            new Date(),
            {},
            [],
        ];
        invalidSlugs.forEach((slug) => {
            expectValidationErrors(new SampleClass(slug), [ {
                'isSlug': 'slug must be a valid slug',
            } ]);
        });
    });

});
