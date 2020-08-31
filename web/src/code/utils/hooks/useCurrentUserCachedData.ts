import { useMeQuery, UserDetailedDataFragment } from '../../../graphql/generated-types';


export function useCurrentUserCachedData(): UserDetailedDataFragment | undefined {
    const { data } = useMeQuery({ fetchPolicy: 'cache-only' });
    return data?.me;
}
