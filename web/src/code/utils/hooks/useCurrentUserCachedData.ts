import { MeQuery, useMeQuery } from '../../../graphql/generated-types';


export function useCurrentUserCachedData(): MeQuery['me'] | undefined {
    const { data } = useMeQuery({ fetchPolicy: 'cache-only' });
    return data?.me;
}
