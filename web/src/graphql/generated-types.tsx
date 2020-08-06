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
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};


export type Query = {
  __typename?: 'Query';
  /** Returns data of the currently authenticated user. */
  me: User;
  products: Array<Offer>;
  projects: Array<Project>;
};

export type User = {
  __typename?: 'User';
  name: Scalars['String'];
  /** Unique user slug. Used in URLs */
  slug: Scalars['String'];
  email: Scalars['String'];
  products: Array<Product>;
  productCount: Scalars['Int'];
  /** User' all projects. */
  projects: Array<Project>;
  /** User project with given project id. */
  project?: Maybe<Project>;
  offers: Array<Offer>;
};


export type UserProjectArgs = {
  slug: Scalars['String'];
};

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID'];
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
  description: Scalars['String'];
  price: CurrencyAmount;
};

export type CurrencyAmount = {
  __typename?: 'CurrencyAmount';
  currency: Scalars['String'];
  amount: Scalars['Float'];
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** Unique project slug. Used in URLs */
  slug: Scalars['String'];
  files: Array<ResourceData>;
};

/** Wrapper for resource file data. */
export type ResourceData = {
  __typename?: 'ResourceData';
  url: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
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
  uploadProjectFile: ResourceData;
  deleteProjectFile: Scalars['Boolean'];
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


export type MutationCreateProductArgs = {
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
  description: Scalars['String'];
  price?: Maybe<CurrencyAmountFormData>;
};


export type MutationCreateProjectArgs = {
  name: Scalars['String'];
};


export type MutationUpdateProjectArgs = {
  projectSlug: Scalars['String'];
  name: Scalars['String'];
};


export type MutationDeleteProjectArgs = {
  projectSlug: Scalars['String'];
};


export type MutationUploadProjectFileArgs = {
  file: Scalars['Upload'];
  description?: Maybe<Scalars['String']>;
  projectSlug: Scalars['String'];
};


export type MutationDeleteProjectFileArgs = {
  projectSlug: Scalars['String'];
  resourceName: Scalars['String'];
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

export type CurrencyAmountFormData = {
  currency: Scalars['String'];
  amount: Scalars['Float'];
};


/** Data returned after successful login or registration */
export type InitialData = {
  __typename?: 'InitialData';
  user: User;
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
      & UserDetailedDataFragment
    ) }
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
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
      & UserDetailedDataFragment
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

export type ProductDataFragment = (
  { __typename?: 'Product' }
  & Pick<Product, 'id' | 'name' | 'tags' | 'description'>
  & { price: (
    { __typename?: 'CurrencyAmount' }
    & Pick<CurrencyAmount, 'currency' | 'amount'>
  ) }
);

export type CreateProductMutationVariables = Exact<{
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
  description: Scalars['String'];
  price?: Maybe<CurrencyAmountFormData>;
}>;


export type CreateProductMutation = (
  { __typename?: 'Mutation' }
  & { createProduct: (
    { __typename?: 'Product' }
    & ProductDataFragment
  ) }
);

export type ProjectBasicDataFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'id' | 'slug' | 'name'>
);

export type ProjectDetailedDataFragment = (
  { __typename?: 'Project' }
  & { files: Array<(
    { __typename?: 'ResourceData' }
    & Pick<ResourceData, 'url' | 'name' | 'description'>
  )> }
  & ProjectBasicDataFragment
);

export type CreateProjectMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateProjectMutation = (
  { __typename?: 'Mutation' }
  & { createProject: (
    { __typename?: 'Project' }
    & ProjectBasicDataFragment
  ) }
);

export type DeleteProjectMutationVariables = Exact<{
  projectSlug: Scalars['String'];
}>;


export type DeleteProjectMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteProject'>
);

export type UpdateProjectMutationVariables = Exact<{
  projectSlug: Scalars['String'];
  name: Scalars['String'];
}>;


export type UpdateProjectMutation = (
  { __typename?: 'Mutation' }
  & { updateProject: (
    { __typename?: 'Project' }
    & ProjectDetailedDataFragment
  ) }
);

export type DeleteProjectFileMutationVariables = Exact<{
  projectSlug: Scalars['String'];
  resourceName: Scalars['String'];
}>;


export type DeleteProjectFileMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteProjectFile'>
);

export type UploadProjectFileMutationVariables = Exact<{
  projectSlug: Scalars['String'];
  file: Scalars['Upload'];
  description?: Maybe<Scalars['String']>;
}>;


export type UploadProjectFileMutation = (
  { __typename?: 'Mutation' }
  & { uploadProjectFile: (
    { __typename?: 'ResourceData' }
    & Pick<ResourceData, 'url' | 'name' | 'description'>
  ) }
);

export type ProjectDetailsQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type ProjectDetailsQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'User' }
    & Pick<User, 'slug'>
    & { project?: Maybe<(
      { __typename?: 'Project' }
      & ProjectDetailedDataFragment
    )> }
  ) }
);

export type UserDetailedDataFragment = (
  { __typename?: 'User' }
  & Pick<User, 'name' | 'slug' | 'email' | 'productCount'>
  & { products: Array<(
    { __typename?: 'Product' }
    & ProductDataFragment
  )>, projects: Array<(
    { __typename?: 'Project' }
    & ProjectBasicDataFragment
  )>, offers: Array<(
    { __typename?: 'Offer' }
    & Pick<Offer, 'name'>
  )> }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'User' }
    & UserDetailedDataFragment
  ) }
);

export const ProjectBasicDataFragmentDoc = gql`
    fragment ProjectBasicData on Project {
  id
  slug
  name
}
    `;
export const ProjectDetailedDataFragmentDoc = gql`
    fragment ProjectDetailedData on Project {
  ...ProjectBasicData
  files {
    url
    name
    description
  }
}
    ${ProjectBasicDataFragmentDoc}`;
export const ProductDataFragmentDoc = gql`
    fragment ProductData on Product {
  id
  name
  tags
  description
  price {
    currency
    amount
  }
}
    `;
export const UserDetailedDataFragmentDoc = gql`
    fragment UserDetailedData on User {
  name
  slug
  email
  products {
    ...ProductData
  }
  productCount
  projects {
    ...ProjectBasicData
  }
  offers {
    name
  }
}
    ${ProductDataFragmentDoc}
${ProjectBasicDataFragmentDoc}`;
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
      ...UserDetailedData
    }
  }
}
    ${UserDetailedDataFragmentDoc}`;

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
export const RegisterDocument = gql`
    mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    accessToken
    user {
      ...UserDetailedData
    }
  }
}
    ${UserDetailedDataFragmentDoc}`;

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
export const CreateProductDocument = gql`
    mutation CreateProduct($name: String!, $tags: [String!]!, $description: String!, $price: CurrencyAmountFormData) {
  createProduct(name: $name, tags: $tags, description: $description, price: $price) {
    ...ProductData
  }
}
    ${ProductDataFragmentDoc}`;

/**
 * __useCreateProductMutation__
 *
 * To run a mutation, you first call `useCreateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProductMutation, { data, loading, error }] = useCreateProductMutation({
 *   variables: {
 *      name: // value for 'name'
 *      tags: // value for 'tags'
 *      description: // value for 'description'
 *      price: // value for 'price'
 *   },
 * });
 */
export function useCreateProductMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateProductMutation, CreateProductMutationVariables>) {
        return ApolloReactHooks.useMutation<CreateProductMutation, CreateProductMutationVariables>(CreateProductDocument, baseOptions);
      }
export type CreateProductMutationHookResult = ReturnType<typeof useCreateProductMutation>;
export type CreateProductMutationResult = ApolloReactCommon.MutationResult<CreateProductMutation>;
export type CreateProductMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateProductMutation, CreateProductMutationVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($name: String!) {
  createProject(name: $name) {
    ...ProjectBasicData
  }
}
    ${ProjectBasicDataFragmentDoc}`;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        return ApolloReactHooks.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, baseOptions);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = ApolloReactCommon.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const DeleteProjectDocument = gql`
    mutation DeleteProject($projectSlug: String!) {
  deleteProject(projectSlug: $projectSlug)
}
    `;

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      projectSlug: // value for 'projectSlug'
 *   },
 * });
 */
export function useDeleteProjectMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteProjectMutation, DeleteProjectMutationVariables>) {
        return ApolloReactHooks.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, baseOptions);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = ApolloReactCommon.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const UpdateProjectDocument = gql`
    mutation UpdateProject($projectSlug: String!, $name: String!) {
  updateProject(projectSlug: $projectSlug, name: $name) {
    ...ProjectDetailedData
  }
}
    ${ProjectDetailedDataFragmentDoc}`;

/**
 * __useUpdateProjectMutation__
 *
 * To run a mutation, you first call `useUpdateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectMutation, { data, loading, error }] = useUpdateProjectMutation({
 *   variables: {
 *      projectSlug: // value for 'projectSlug'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateProjectMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateProjectMutation, UpdateProjectMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(UpdateProjectDocument, baseOptions);
      }
export type UpdateProjectMutationHookResult = ReturnType<typeof useUpdateProjectMutation>;
export type UpdateProjectMutationResult = ApolloReactCommon.MutationResult<UpdateProjectMutation>;
export type UpdateProjectMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const DeleteProjectFileDocument = gql`
    mutation DeleteProjectFile($projectSlug: String!, $resourceName: String!) {
  deleteProjectFile(projectSlug: $projectSlug, resourceName: $resourceName)
}
    `;

/**
 * __useDeleteProjectFileMutation__
 *
 * To run a mutation, you first call `useDeleteProjectFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectFileMutation, { data, loading, error }] = useDeleteProjectFileMutation({
 *   variables: {
 *      projectSlug: // value for 'projectSlug'
 *      resourceName: // value for 'resourceName'
 *   },
 * });
 */
export function useDeleteProjectFileMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteProjectFileMutation, DeleteProjectFileMutationVariables>) {
        return ApolloReactHooks.useMutation<DeleteProjectFileMutation, DeleteProjectFileMutationVariables>(DeleteProjectFileDocument, baseOptions);
      }
export type DeleteProjectFileMutationHookResult = ReturnType<typeof useDeleteProjectFileMutation>;
export type DeleteProjectFileMutationResult = ApolloReactCommon.MutationResult<DeleteProjectFileMutation>;
export type DeleteProjectFileMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteProjectFileMutation, DeleteProjectFileMutationVariables>;
export const UploadProjectFileDocument = gql`
    mutation UploadProjectFile($projectSlug: String!, $file: Upload!, $description: String) {
  uploadProjectFile(projectSlug: $projectSlug, file: $file, description: $description) {
    url
    name
    description
  }
}
    `;

/**
 * __useUploadProjectFileMutation__
 *
 * To run a mutation, you first call `useUploadProjectFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadProjectFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadProjectFileMutation, { data, loading, error }] = useUploadProjectFileMutation({
 *   variables: {
 *      projectSlug: // value for 'projectSlug'
 *      file: // value for 'file'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useUploadProjectFileMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UploadProjectFileMutation, UploadProjectFileMutationVariables>) {
        return ApolloReactHooks.useMutation<UploadProjectFileMutation, UploadProjectFileMutationVariables>(UploadProjectFileDocument, baseOptions);
      }
export type UploadProjectFileMutationHookResult = ReturnType<typeof useUploadProjectFileMutation>;
export type UploadProjectFileMutationResult = ApolloReactCommon.MutationResult<UploadProjectFileMutation>;
export type UploadProjectFileMutationOptions = ApolloReactCommon.BaseMutationOptions<UploadProjectFileMutation, UploadProjectFileMutationVariables>;
export const ProjectDetailsDocument = gql`
    query ProjectDetails($slug: String!) {
  me {
    slug
    project(slug: $slug) {
      ...ProjectDetailedData
    }
  }
}
    ${ProjectDetailedDataFragmentDoc}`;

/**
 * __useProjectDetailsQuery__
 *
 * To run a query within a React component, call `useProjectDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectDetailsQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useProjectDetailsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ProjectDetailsQuery, ProjectDetailsQueryVariables>) {
        return ApolloReactHooks.useQuery<ProjectDetailsQuery, ProjectDetailsQueryVariables>(ProjectDetailsDocument, baseOptions);
      }
export function useProjectDetailsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProjectDetailsQuery, ProjectDetailsQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<ProjectDetailsQuery, ProjectDetailsQueryVariables>(ProjectDetailsDocument, baseOptions);
        }
export type ProjectDetailsQueryHookResult = ReturnType<typeof useProjectDetailsQuery>;
export type ProjectDetailsLazyQueryHookResult = ReturnType<typeof useProjectDetailsLazyQuery>;
export type ProjectDetailsQueryResult = ApolloReactCommon.QueryResult<ProjectDetailsQuery, ProjectDetailsQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    ...UserDetailedData
  }
}
    ${UserDetailedDataFragmentDoc}`;

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