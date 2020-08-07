import { renderHook } from '@testing-library/react-hooks';

import { mockUseCurrentUserCachedData } from '../../__mocks__/code/mockUseCurrentUserCachedData';

import { CurrentUserDataSelectors, useCurrentUserDataSelectors } from '../../../code/utils/hooks/useCurrentUserDataSelectors';
import { Product, User } from '../../../graphql/generated-types';


describe('useCurrentUserDataSelectors hook', () => {

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    describe('tags selector', () => {

        beforeEach(() => {
            jest.spyOn(Array, 'from');
        });

        it('should recalculate data only when user data change', () => {
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [
                    { tags: null } as Product,
                    { tags: [ 'C', 'A' ] } as Product,
                    { tags: [ 'A', 'B' ] } as Product,
                ],
            });
            const { result, rerender } = renderHook(useCurrentUserDataSelectors);

            // verify if selector was not calculated if was not called
            expect(Array.from).toHaveBeenCalledTimes(0);

            // call selector and rerender hook multiple times
            const tagsResult: ReturnType<CurrentUserDataSelectors['tags']>[] = [];
            tagsResult.push(result.current[ 0 ].tags());
            tagsResult.push(result.current[ 0 ].tags());
            tagsResult.push(result.current[ 0 ].tags());
            rerender();
            tagsResult.push(result.current[ 0 ].tags());
            rerender();
            tagsResult.push(result.current[ 0 ].tags());

            // verify if selector was calculated only once
            expect(Array.from).toHaveBeenCalledTimes(1);

            // verify if selector always returned the same array instance
            expect(tagsResult.every(r => r === tagsResult[ 0 ])).toBe(true);
            expect(tagsResult[ 0 ]).toEqual([ { name: 'A' }, { name: 'B' }, { name: 'C' } ]);

            // simulate user data change
            mockUseCurrentUserCachedData.mockReturnValue({
                ...sampleUser,
                products: [
                    { tags: [ 'C', 'A' ] } as Product,
                ],
            });

            // call selector and rerender hook multiple times
            const tagsResultAfterChange: ReturnType<CurrentUserDataSelectors['tags']>[] = [];
            rerender();
            tagsResultAfterChange.push(result.current[ 0 ].tags());
            rerender();
            tagsResultAfterChange.push(result.current[ 0 ].tags());

            // verify if selector was recalculated only once
            expect(Array.from).toHaveBeenCalledTimes(2);

            // verify if selector always returned the same array instance
            expect(tagsResultAfterChange.every(r => r === tagsResultAfterChange[ 0 ])).toBe(true);
            expect(tagsResultAfterChange[ 0 ]).toEqual([ { name: 'A' }, { name: 'C' } ]);
        });

    });

});
