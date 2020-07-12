import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';


export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  /** Returns data of the currently authenticated user. */
  me: User;
  products: Array<Offer>;
  projects: Array<Project>;
  sessionState: SessionState;
};

export type User = {
  __typename?: 'User';
  name: Scalars['String'];
  /** Unique user slug. Used in URLs */
  slug: Scalars['String'];
  email: Scalars['String'];
  products: Array<Product>;
  productCount: Scalars['Int'];
  projects: Array<Project>;
  offers: Array<Offer>;
};

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** Unique project slug. Used in URLs */
  slug: Scalars['String'];
};

export type Offer = {
  __typename?: 'Offer';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Sends password reset instructions to given email address. */
  sendPasswordResetInstructions: Scalars['Boolean'];
  /** Based on token from email, changes user password. */
  resetPassword: Scalars['Boolean'];
  createProduct: Product;
  updateProduct: Product;
  deleteProduct: Scalars['Boolean'];
  createProject: Project;
  updateProject: Project;
  deleteProject: Scalars['Boolean'];
  /** Registers and additionally authenticates new user. */
  register: InitialData;
  /** Registration second step - confirms that the user is owner of the provided email address. */
  confirmEmailAddress: Scalars['Boolean'];
  createOffer: Offer;
  updateOffer: Offer;
  deleteOffer: Scalars['Boolean'];
  /** Authenticates user. */
  login: InitialData;
  /** Invalidates user session. */
  logout: Scalars['Boolean'];
};


export type MutationSendPasswordResetInstructionsArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  token: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateProjectArgs = {
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};


export type MutationUpdateProjectArgs = {
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['String'];
};


export type MutationRegisterArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  name: Scalars['String'];
};


export type MutationConfirmEmailAddressArgs = {
  token: Scalars['String'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};

/** Data returned after successful login or registration */
export type InitialData = {
  __typename?: 'InitialData';
  user: User;
  accessToken: Scalars['String'];
};

export type SessionState = {
  __typename?: 'SessionState';
  accessToken: Scalars['String'];
};

export type ConfirmEmailAddressMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type ConfirmEmailAddressMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'confirmEmailAddress'>
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'InitialData' }
    & Pick<InitialData, 'accessToken'>
    & { user: (
      { __typename?: 'User' }
      & Pick<User, 'name' | 'slug' | 'email' | 'productCount'>
      & { products: Array<(
        { __typename?: 'Product' }
        & Pick<Product, 'name'>
      )>, projects: Array<(
        { __typename?: 'Project' }
        & Pick<Project, 'id' | 'name' | 'slug'>
      )>, offers: Array<(
        { __typename?: 'Offer' }
        & Pick<Offer, 'name'>
      )> }
    ) }
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'User' }
    & Pick<User, 'name' | 'slug' | 'email' | 'productCount'>
    & { products: Array<(
      { __typename?: 'Product' }
      & Pick<Product, 'name'>
    )>, projects: Array<(
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'slug'>
    )>, offers: Array<(
      { __typename?: 'Offer' }
      & Pick<Offer, 'name'>
    )> }
  ) }
);

export type RegisterMutationVariables = Exact<{
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'InitialData' }
    & Pick<InitialData, 'accessToken'>
    & { user: (
      { __typename?: 'User' }
      & Pick<User, 'name' | 'slug' | 'email' | 'productCount'>
      & { products: Array<(
        { __typename?: 'Product' }
        & Pick<Product, 'name'>
      )>, projects: Array<(
        { __typename?: 'Project' }
        & Pick<Project, 'id' | 'name' | 'slug'>
      )>, offers: Array<(
        { __typename?: 'Offer' }
        & Pick<Offer, 'name'>
      )> }
    ) }
  ) }
);

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ResetPasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'resetPassword'>
);

export type SendPasswordResetInstructionsMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type SendPasswordResetInstructionsMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'sendPasswordResetInstructions'>
);

export type SessionStateQueryVariables = Exact<{ [key: string]: never; }>;


export type SessionStateQuery = (
  { __typename?: 'Query' }
  & { sessionState: (
    { __typename?: 'SessionState' }
    & Pick<SessionState, 'accessToken'>
  ) }
);


export const ConfirmEmailAddressDocument = gql`
    mutation ConfirmEmailAddress($token: String!) {
  confirmEmailAddress(token: $token)
}
    `;

/**
 * __useConfirmEmailAddressMutation__
 *
 * To run a mutation, you first call `useConfirmEmailAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmEmailAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmEmailAddressMutation, { data, loading, error }] = useConfirmEmailAddressMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useConfirmEmailAddressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ConfirmEmailAddressMutation, ConfirmEmailAddressMutationVariables>) {
        return ApolloReactHooks.useMutation<ConfirmEmailAddressMutation, ConfirmEmailAddressMutationVariables>(ConfirmEmailAddressDocument, baseOptions);
      }
export type ConfirmEmailAddressMutationHookResult = ReturnType<typeof useConfirmEmailAddressMutation>;
export type ConfirmEmailAddressMutationResult = ApolloReactCommon.MutationResult<ConfirmEmailAddressMutation>;
export type ConfirmEmailAddressMutationOptions = ApolloReactCommon.BaseMutationOptions<ConfirmEmailAddressMutation, ConfirmEmailAddressMutationVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    user {
      name
      slug
      email
      products {
        name
      }
      productCount
      projects {
        id
        name
        slug
      }
      offers {
        name
      }
    }
  }
}
    `;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = ApolloReactCommon.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = ApolloReactCommon.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    name
    slug
    email
    products {
      name
    }
    productCount
    projects {
      id
      name
      slug
    }
    offers {
      name
    }
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>) {
        return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = ApolloReactCommon.QueryResult<MeQuery, MeQueryVariables>;
export const RegisterDocument = gql`
    mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    accessToken
    user {
      name
      slug
      email
      products {
        name
      }
      productCount
      projects {
        id
        name
        slug
      }
      offers {
        name
      }
    }
  }
}
    `;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        return ApolloReactHooks.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, baseOptions);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = ApolloReactCommon.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = ApolloReactCommon.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($token: String!, $password: String!) {
  resetPassword(token: $token, password: $password)
}
    `;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        return ApolloReactHooks.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, baseOptions);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = ApolloReactCommon.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const SendPasswordResetInstructionsDocument = gql`
    mutation SendPasswordResetInstructions($email: String!) {
  sendPasswordResetInstructions(email: $email)
}
    `;

/**
 * __useSendPasswordResetInstructionsMutation__
 *
 * To run a mutation, you first call `useSendPasswordResetInstructionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendPasswordResetInstructionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendPasswordResetInstructionsMutation, { data, loading, error }] = useSendPasswordResetInstructionsMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSendPasswordResetInstructionsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SendPasswordResetInstructionsMutation, SendPasswordResetInstructionsMutationVariables>) {
        return ApolloReactHooks.useMutation<SendPasswordResetInstructionsMutation, SendPasswordResetInstructionsMutationVariables>(SendPasswordResetInstructionsDocument, baseOptions);
      }
export type SendPasswordResetInstructionsMutationHookResult = ReturnType<typeof useSendPasswordResetInstructionsMutation>;
export type SendPasswordResetInstructionsMutationResult = ApolloReactCommon.MutationResult<SendPasswordResetInstructionsMutation>;
export type SendPasswordResetInstructionsMutationOptions = ApolloReactCommon.BaseMutationOptions<SendPasswordResetInstructionsMutation, SendPasswordResetInstructionsMutationVariables>;
export const SessionStateDocument = gql`
    query SessionState {
  sessionState @client {
    accessToken
  }
}
    `;

/**
 * __useSessionStateQuery__
 *
 * To run a query within a React component, call `useSessionStateQuery` and pass it any options that fit your needs.
 * When your component renders, `useSessionStateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSessionStateQuery({
 *   variables: {
 *   },
 * });
 */
export function useSessionStateQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SessionStateQuery, SessionStateQueryVariables>) {
        return ApolloReactHooks.useQuery<SessionStateQuery, SessionStateQueryVariables>(SessionStateDocument, baseOptions);
      }
export function useSessionStateLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SessionStateQuery, SessionStateQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<SessionStateQuery, SessionStateQueryVariables>(SessionStateDocument, baseOptions);
        }
export type SessionStateQueryHookResult = ReturnType<typeof useSessionStateQuery>;
export type SessionStateLazyQueryHookResult = ReturnType<typeof useSessionStateLazyQuery>;
export type SessionStateQueryResult = ApolloReactCommon.QueryResult<SessionStateQuery, SessionStateQueryVariables>;
