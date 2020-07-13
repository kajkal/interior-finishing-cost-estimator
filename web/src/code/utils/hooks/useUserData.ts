import { useMeQuery } from '../../../graphql/generated-types';


export interface UserData {
    slug: string;
}

export interface UseUserDataHookResult {
    userData: UserData | undefined;
    isLoggedIn: boolean;
}

export function useUserData(): UseUserDataHookResult {
    const { data } = useMeQuery({ fetchPolicy: 'cache-only' });
    return {
        userData: data && {
            slug: data.me.slug,
        },
        isLoggedIn: Boolean(data?.me),
    };
}
