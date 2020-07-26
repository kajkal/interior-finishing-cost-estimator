import { MeQuery } from '../../../graphql/generated-types';


export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export const mockUseCurrentUserCachedData: jest.MockedFunction<() => DeepPartial<MeQuery['me'] | undefined>> = jest.fn();

jest.mock('../../../code/utils/hooks/useCurrentUserCachedData', () => ({
    useCurrentUserCachedData: mockUseCurrentUserCachedData,
}));
