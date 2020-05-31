import { DataProxy } from 'apollo-cache';
import { LocalState, LocalStateDocument, LocalStateQuery, LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../../../../graphql/generated-types';


export interface ApolloCacheShape {
    localState: LocalState;
}

export class ApolloCacheManager {

    private static readonly DEFAULT_LOCAL_STATE: LocalState = {
        accessToken: '',
    };

    /**
     * Initialize Apollo local state
     * @param cache
     */
    static initLocalState(cache: DataProxy) {
        this.setLocalState(cache, this.DEFAULT_LOCAL_STATE);
    }

    /**
     * Sets Apollo local state.
     */
    static setLocalState(cache: DataProxy, newState: LocalState) {
        cache.writeQuery<LocalStateQuery>({
            query: LocalStateDocument,
            data: {
                localState: {
                    __typename: 'LocalState',
                    ...newState,
                },
            },
        });
    }

    /**
     * Returns Apollo local state.
     */
    static getLocalState(cache: DataProxy): LocalState {
        const { localState } = cache.readQuery<LocalStateQuery>({ query: LocalStateDocument })!;
        return localState;
    }

    /**
     * Login or register mutations handler.
     * Adds access token and user initial data to cache.
     */
    static handleAccessMutationResponse(cache: DataProxy, initialData: LoginMutation['login'] | RegisterMutation['register']) {
        cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
                me: initialData.user,
            },
        });
        this.setLocalState(cache, {
            accessToken: initialData.accessToken,
        });
    }

}
