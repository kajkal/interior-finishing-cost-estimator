import { areAllOptionsSelected, isOptionExclusivelySelected, isOptionSelected } from '../../../code/utils/filters/filtersUtils';


describe('filtersUtils file', () => {

    describe('isOptionSelected function', () => {

        it('should return true only when option is selected', () => {
            expect(isOptionSelected('ALL', 'option a')).toBe(true);
            expect(isOptionSelected(new Set([ 'option a' ]), 'option a')).toBe(true);
            expect(isOptionSelected(new Set(), 'option a')).toBe(false);
        });

    });

    describe('isOptionExclusivelySelected function', () => {

        it('should return true only when option is exclusively selected', () => {
            expect(isOptionExclusivelySelected('ALL', 'option a')).toBe(false);
            expect(isOptionExclusivelySelected(new Set([ 'option a' ]), 'option a')).toBe(true);
            expect(isOptionExclusivelySelected(new Set(), 'option a')).toBe(false);
        });

    });

    describe('areAllOptionsSelected function', () => {

        it('should return true only when all options are selected', () => {
            expect(areAllOptionsSelected('ALL')).toBe(true);
            expect(areAllOptionsSelected(new Set([ 'option a' ]))).toBe(false);
            expect(areAllOptionsSelected(new Set())).toBe(false);
        });

    });

});
