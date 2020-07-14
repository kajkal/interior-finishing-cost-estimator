import { useMeQuery } from '../../../graphql/generated-types';


export interface ProjectData {
    id: string;
    name: string;
    slug: string;
}

export interface UserData {
    slug: string;
    name: string;
    projects: ProjectData[];
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
            name: data.me.name,
            projects: data.me.projects,
        },
        isLoggedIn: Boolean(data?.me),
    };
}
