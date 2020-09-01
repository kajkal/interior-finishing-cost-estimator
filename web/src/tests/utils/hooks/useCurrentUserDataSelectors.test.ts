import { renderHook } from '@testing-library/react-hooks';

import { mockUseCurrentUserCachedData } from '../../__mocks__/code/mockUseCurrentUserCachedData';
import { generator } from '../../__utils__/generator';

import { CurrentUserDataSelectors, useCurrentUserDataSelectors } from '../../../code/utils/hooks/useCurrentUserDataSelectors';


describe('useCurrentUserDataSelectors hook', () => {

    const memorySetterSpy = jest.spyOn(WeakMap.prototype, 'set');

    const sampleUser = generator.user();

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
        memorySetterSpy?.mockClear();
    });

    describe('tags selector', () => {

        it('should recalculate data only when user data change', () => {
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [
                    generator.product({ tags: null }),
                    generator.product({ tags: [ 'C', 'A' ] }),
                    generator.product({ tags: [ 'A', 'B' ] }),
                ],
            });
            const { result, rerender } = renderHook(useCurrentUserDataSelectors);

            // verify if selector was not calculated if was not called
            expect(WeakMap.prototype.set).toHaveBeenCalledTimes(0);

            // call selector and rerender hook multiple times
            const tagsResult: ReturnType<CurrentUserDataSelectors['tags']>[] = [];
            tagsResult.push(result.current[ 0 ].tags());
            tagsResult.push(result.current[ 0 ].tags());
            rerender();
            tagsResult.push(result.current[ 0 ].tags());
            rerender();
            tagsResult.push(result.current[ 0 ].tags());

            // verify if selector was calculated only once
            expect(WeakMap.prototype.set).toHaveBeenCalledTimes(1);

            // verify if selector always returned the same array instance
            expect(tagsResult.every(r => r === tagsResult[ 0 ])).toBe(true);
            expect(tagsResult[ 0 ]).toEqual([
                { name: 'A', occurrenceCount: 2 },
                { name: 'B', occurrenceCount: 1 },
                { name: 'C', occurrenceCount: 1 },
            ]);

            // simulate user data change
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [
                    generator.product({ tags: [ 'C', 'A' ] }),
                ],
            });

            // call selector and rerender hook multiple times
            const tagsResultAfterChange: ReturnType<CurrentUserDataSelectors['tags']>[] = [];
            rerender();
            tagsResultAfterChange.push(result.current[ 0 ].tags());
            rerender();
            tagsResultAfterChange.push(result.current[ 0 ].tags());

            // verify if selector was recalculated only once
            expect(WeakMap.prototype.set).toHaveBeenCalledTimes(2);

            // verify if selector always returned the same array instance
            expect(tagsResultAfterChange.every(r => r === tagsResultAfterChange[ 0 ])).toBe(true);
            expect(tagsResultAfterChange[ 0 ]).toEqual([
                { name: 'A', occurrenceCount: 1 },
                { name: 'C', occurrenceCount: 1 },
            ]);
        });

    });

    describe('dates statistics selector', () => {

        it('should recalculate data only when user data change', () => {
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [
                    generator.product({ createdAt: '2020-08-06T14:00:00.000Z' }),
                    generator.product({ createdAt: '2020-08-06T15:00:00.000Z' }),
                    generator.product({ createdAt: '2020-08-06T12:00:00.000Z' }),
                ],
            });
            const { result, rerender } = renderHook(useCurrentUserDataSelectors);

            // verify if selector was not calculated if was not called
            expect(WeakMap.prototype.set).toHaveBeenCalledTimes(0);

            // call selector and rerender hook multiple times
            const datesResult: ReturnType<CurrentUserDataSelectors['dates']>[] = [];
            datesResult.push(result.current[ 0 ].dates());
            datesResult.push(result.current[ 0 ].dates());
            rerender();
            datesResult.push(result.current[ 0 ].dates());
            rerender();
            datesResult.push(result.current[ 0 ].dates());

            // verify if selector was calculated only once
            expect(WeakMap.prototype.set).toHaveBeenCalledTimes(1);

            // verify if selector always returned the same object instance
            expect(datesResult.every(r => r === datesResult[ 0 ])).toBe(true);
            expect(datesResult[ 0 ]).toEqual({
                min: '2020-08-06T12:00:00.000Z',
                max: '2020-08-06T15:00:00.000Z',
            });

            // simulate user data change
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [
                    generator.product({ createdAt: '2020-08-06T14:00:00.000Z' }),
                ],
            });

            // call selector and rerender hook multiple times
            const datesResultAfterChange: ReturnType<CurrentUserDataSelectors['dates']>[] = [];
            rerender();
            datesResultAfterChange.push(result.current[ 0 ].dates());
            rerender();
            datesResultAfterChange.push(result.current[ 0 ].dates());

            // verify if selector was recalculated only once
            expect(WeakMap.prototype.set).toHaveBeenCalledTimes(2);

            // verify if selector always returned the same object instance
            expect(datesResultAfterChange.every(r => r === datesResultAfterChange[ 0 ])).toBe(true);
            expect(datesResultAfterChange[ 0 ]).toEqual({
                min: '2020-08-06T14:00:00.000Z',
                max: '2020-08-06T14:00:00.000Z',
            });

            // simulate user data change
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [],
            });

            rerender();
            expect(result.current[ 0 ].dates()).toEqual(undefined);
        });

    });

});
