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
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};


export type Query = {
  __typename?: 'Query';
  /** Returns data of the currently authenticated user. */
  me: User;
  projects: Array<Project>;
  allInquiries: Array<Inquiry>;
  /** Returns user', publicly available, profile data */
  profile: Profile;
};


export type QueryProfileArgs = {
  userSlug: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  isEmailAddressConfirmed?: Maybe<Scalars['Boolean']>;
  hidden?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  /** Unique user slug. Used in URLs */
  slug: Scalars['String'];
  bookmarkedInquiries: Array<Scalars['String']>;
  products: Array<Product>;
  /** User' all projects. */
  projects: Array<Project>;
  /** User project with given project id. */
  project?: Maybe<Project>;
  /** Inquiries opened by user */
  inquiries: Array<Inquiry>;
  /** User' avatar url */
  avatar?: Maybe<Scalars['String']>;
};


export type UserProjectArgs = {
  slug: Scalars['String'];
};

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** Serialized description */
  description: Scalars['String'];
  price?: Maybe<CurrencyAmount>;
  tags?: Maybe<Array<Scalars['String']>>;
  createdAt: Scalars['DateTime'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type CurrencyAmount = {
  __typename?: 'CurrencyAmount';
  currency: Scalars['String'];
  amount: Scalars['Float'];
};


export type Project = {
  __typename?: 'Project';
  /** Unique project slug. Used in URLs */
  slug: Scalars['String'];
  name: Scalars['String'];
  location?: Maybe<Location>;
  files: Array<ResourceData>;
};

/** Data extracted from place object https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#library_5 */
export type Location = {
  __typename?: 'Location';
  placeId: Scalars['String'];
  main: Scalars['String'];
  secondary: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
};

/** Wrapper for resource file data. */
export type ResourceData = {
  __typename?: 'ResourceData';
  url: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type Inquiry = {
  __typename?: 'Inquiry';
  id: Scalars['ID'];
  title: Scalars['String'];
  /** Serialized description */
  description: Scalars['String'];
  location: Location;
  category: Category;
  createdAt: Scalars['DateTime'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  author: Author;
  quotes?: Maybe<Array<PriceQuote>>;
};

export enum Category {
  ELECTRICAL = 'ELECTRICAL',
  PIPING = 'PIPING',
  INTERIOR_FINISHING = 'INTERIOR_FINISHING',
  CARPENTRY = 'CARPENTRY',
  INSTALLATION = 'INSTALLATION',
  DESIGNING = 'DESIGNING'
}

export type Author = {
  __typename?: 'Author';
  userSlug: Scalars['String'];
  name: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
};

export type PriceQuote = {
  __typename?: 'PriceQuote';
  author: Author;
  date: Scalars['DateTime'];
  price: CurrencyAmount;
};

export type Profile = {
  __typename?: 'Profile';
  userSlug: Scalars['String'];
  name: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  /** Serialized user profile */
  description?: Maybe<Scalars['String']>;
  location?: Maybe<Location>;
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
  createInquiry: Inquiry;
  updateInquiry: Inquiry;
  deleteInquiry: Scalars['Boolean'];
  addQuote: Array<PriceQuote>;
  removeQuote: Array<PriceQuote>;
  bookmarkInquiry: Array<Scalars['String']>;
  /** Authenticates user. */
  login: InitialData;
  /** Invalidates user session. */
  logout: Scalars['Boolean'];
  updateProfile: Profile;
  changeEmail: Scalars['Boolean'];
  changePassword: Scalars['Boolean'];
  changeProfileSettings: Scalars['Boolean'];
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
  description: Scalars['String'];
  price?: Maybe<CurrencyAmountFormData>;
  tags?: Maybe<Array<Scalars['String']>>;
};


export type MutationUpdateProductArgs = {
  name: Scalars['String'];
  description: Scalars['String'];
  price?: Maybe<CurrencyAmountFormData>;
  tags?: Maybe<Array<Scalars['String']>>;
  productId: Scalars['String'];
};


export type MutationDeleteProductArgs = {
  productId: Scalars['String'];
};


export type MutationCreateProjectArgs = {
  name: Scalars['String'];
  location?: Maybe<LocationFormData>;
};


export type MutationUpdateProjectArgs = {
  name: Scalars['String'];
  location?: Maybe<LocationFormData>;
  projectSlug: Scalars['String'];
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


export type MutationCreateInquiryArgs = {
  title: Scalars['String'];
  description: Scalars['String'];
  location: LocationFormData;
  category: Category;
};


export type MutationUpdateInquiryArgs = {
  title: Scalars['String'];
  description: Scalars['String'];
  location: LocationFormData;
  category: Category;
  inquiryId: Scalars['String'];
};


export type MutationDeleteInquiryArgs = {
  inquiryId: Scalars['String'];
};


export type MutationAddQuoteArgs = {
  inquiryId: Scalars['String'];
  price: CurrencyAmountFormData;
};


export type MutationRemoveQuoteArgs = {
  inquiryId: Scalars['String'];
  quoteDate: Scalars['DateTime'];
};


export type MutationBookmarkInquiryArgs = {
  inquiryId: Scalars['String'];
  bookmark: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationUpdateProfileArgs = {
  name?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['Upload']>;
  removeCurrentAvatar?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  location?: Maybe<LocationFormData>;
};


export type MutationChangeEmailArgs = {
  email: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationChangeProfileSettingsArgs = {
  hidden: Scalars['Boolean'];
};

export type CurrencyAmountFormData = {
  currency: Scalars['String'];
  amount: Scalars['Float'];
};

export type LocationFormData = {
  placeId: Scalars['String'];
  main: Scalars['String'];
  secondary: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
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

export type InquiryDataFragment = (
  { __typename?: 'Inquiry' }
  & Pick<Inquiry, 'id' | 'title' | 'description' | 'category' | 'createdAt' | 'updatedAt'>
  & { location: (
    { __typename?: 'Location' }
    & Pick<Location, 'placeId' | 'main' | 'secondary' | 'lat' | 'lng'>
  ), author: (
    { __typename?: 'Author' }
    & Pick<Author, 'userSlug' | 'name' | 'avatar'>
  ), quotes?: Maybe<Array<(
    { __typename?: 'PriceQuote' }
    & PriceQuoteDataFragment
  )>> }
);

export type PriceQuoteDataFragment = (
  { __typename?: 'PriceQuote' }
  & Pick<PriceQuote, 'date'>
  & { author: (
    { __typename?: 'Author' }
    & Pick<Author, 'userSlug' | 'name' | 'avatar'>
  ), price: (
    { __typename?: 'CurrencyAmount' }
    & Pick<CurrencyAmount, 'currency' | 'amount'>
  ) }
);

export type AddQuoteMutationVariables = Exact<{
  inquiryId: Scalars['String'];
  price: CurrencyAmountFormData;
}>;


export type AddQuoteMutation = (
  { __typename?: 'Mutation' }
  & { addQuote: Array<(
    { __typename?: 'PriceQuote' }
    & PriceQuoteDataFragment
  )> }
);

export type BookmarkInquiryMutationVariables = Exact<{
  inquiryId: Scalars['String'];
  bookmark: Scalars['Boolean'];
}>;


export type BookmarkInquiryMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'bookmarkInquiry'>
);

export type CreateInquiryMutationVariables = Exact<{
  title: Scalars['String'];
  description: Scalars['String'];
  location: LocationFormData;
  category: Category;
}>;


export type CreateInquiryMutation = (
  { __typename?: 'Mutation' }
  & { createInquiry: (
    { __typename?: 'Inquiry' }
    & InquiryDataFragment
  ) }
);

export type DeleteInquiryMutationVariables = Exact<{
  inquiryId: Scalars['String'];
}>;


export type DeleteInquiryMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteInquiry'>
);

export type RemoveQuoteMutationVariables = Exact<{
  inquiryId: Scalars['String'];
  quoteDate: Scalars['DateTime'];
}>;


export type RemoveQuoteMutation = (
  { __typename?: 'Mutation' }
  & { removeQuote: Array<(
    { __typename?: 'PriceQuote' }
    & PriceQuoteDataFragment
  )> }
);

export type UpdateInquiryMutationVariables = Exact<{
  inquiryId: Scalars['String'];
  title: Scalars['String'];
  description: Scalars['String'];
  location: LocationFormData;
  category: Category;
}>;


export type UpdateInquiryMutation = (
  { __typename?: 'Mutation' }
  & { updateInquiry: (
    { __typename?: 'Inquiry' }
    & InquiryDataFragment
  ) }
);

export type InquiriesQueryVariables = Exact<{ [key: string]: never; }>;


export type InquiriesQuery = (
  { __typename?: 'Query' }
  & { allInquiries: Array<(
    { __typename?: 'Inquiry' }
    & InquiryDataFragment
  )> }
);

export type ProductDataFragment = (
  { __typename?: 'Product' }
  & Pick<Product, 'id' | 'name' | 'tags' | 'description' | 'createdAt' | 'updatedAt'>
  & { price?: Maybe<(
    { __typename?: 'CurrencyAmount' }
    & Pick<CurrencyAmount, 'currency' | 'amount'>
  )> }
);

export type CreateProductMutationVariables = Exact<{
  name: Scalars['String'];
  description: Scalars['String'];
  price?: Maybe<CurrencyAmountFormData>;
  tags?: Maybe<Array<Scalars['String']>>;
}>;


export type CreateProductMutation = (
  { __typename?: 'Mutation' }
  & { createProduct: (
    { __typename?: 'Product' }
    & ProductDataFragment
  ) }
);

export type DeleteProductMutationVariables = Exact<{
  productId: Scalars['String'];
}>;


export type DeleteProductMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteProduct'>
);

export type UpdateProductMutationVariables = Exact<{
  productId: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
  price?: Maybe<CurrencyAmountFormData>;
  tags?: Maybe<Array<Scalars['String']>>;
}>;


export type UpdateProductMutation = (
  { __typename?: 'Mutation' }
  & { updateProduct: (
    { __typename?: 'Product' }
    & ProductDataFragment
  ) }
);

export type ProjectBasicDataFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'slug' | 'name'>
);

export type ProjectDetailedDataFragment = (
  { __typename?: 'Project' }
  & { location?: Maybe<(
    { __typename?: 'Location' }
    & Pick<Location, 'placeId' | 'main' | 'secondary' | 'lat' | 'lng'>
  )>, files: Array<(
    { __typename?: 'ResourceData' }
    & Pick<ResourceData, 'url' | 'name' | 'description'>
  )> }
  & ProjectBasicDataFragment
);

export type CreateProjectMutationVariables = Exact<{
  name: Scalars['String'];
  location?: Maybe<LocationFormData>;
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
  location?: Maybe<LocationFormData>;
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
  & Pick<User, 'name' | 'slug' | 'email' | 'isEmailAddressConfirmed' | 'hidden' | 'avatar' | 'bookmarkedInquiries'>
  & { products: Array<(
    { __typename?: 'Product' }
    & ProductDataFragment
  )>, projects: Array<(
    { __typename?: 'Project' }
    & ProjectBasicDataFragment
  )>, inquiries: Array<(
    { __typename?: 'Inquiry' }
    & InquiryDataFragment
  )> }
);

export type UserProfileDataFragment = (
  { __typename?: 'Profile' }
  & Pick<Profile, 'userSlug' | 'name' | 'avatar' | 'description'>
  & { location?: Maybe<(
    { __typename?: 'Location' }
    & Pick<Location, 'placeId' | 'main' | 'secondary' | 'lat' | 'lng'>
  )> }
);

export type ChangeEmailMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ChangeEmailMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'changeEmail'>
);

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type ChangePasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'changePassword'>
);

export type ChangeProfileSettingsMutationVariables = Exact<{
  hidden: Scalars['Boolean'];
}>;


export type ChangeProfileSettingsMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'changeProfileSettings'>
);

export type UpdateProfileMutationVariables = Exact<{
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  location?: Maybe<LocationFormData>;
  avatar?: Maybe<Scalars['Upload']>;
  removeCurrentAvatar?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateProfileMutation = (
  { __typename?: 'Mutation' }
  & { updateProfile: (
    { __typename?: 'Profile' }
    & UserProfileDataFragment
  ) }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'User' }
    & UserDetailedDataFragment
  ) }
);

export type ProfileQueryVariables = Exact<{
  userSlug: Scalars['String'];
}>;


export type ProfileQuery = (
  { __typename?: 'Query' }
  & { profile: (
    { __typename?: 'Profile' }
    & UserProfileDataFragment
  ) }
);

export const ProjectBasicDataFragmentDoc = gql`
    fragment ProjectBasicData on Project {
  slug
  name
}
    `;
export const ProjectDetailedDataFragmentDoc = gql`
    fragment ProjectDetailedData on Project {
  ...ProjectBasicData
  location {
    placeId
    main
    secondary
    lat
    lng
  }
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
  createdAt
  updatedAt
}
    `;
export const PriceQuoteDataFragmentDoc = gql`
    fragment PriceQuoteData on PriceQuote {
  author {
    userSlug
    name
    avatar
  }
  date
  price {
    currency
    amount
  }
}
    `;
export const InquiryDataFragmentDoc = gql`
    fragment InquiryData on Inquiry {
  id
  title
  description
  location {
    placeId
    main
    secondary
    lat
    lng
  }
  category
  author {
    userSlug
    name
    avatar
  }
  quotes {
    ...PriceQuoteData
  }
  createdAt
  updatedAt
}
    ${PriceQuoteDataFragmentDoc}`;
export const UserDetailedDataFragmentDoc = gql`
    fragment UserDetailedData on User {
  name
  slug
  email
  isEmailAddressConfirmed
  hidden
  avatar
  products {
    ...ProductData
  }
  projects {
    ...ProjectBasicData
  }
  inquiries {
    ...InquiryData
  }
  bookmarkedInquiries
}
    ${ProductDataFragmentDoc}
${ProjectBasicDataFragmentDoc}
${InquiryDataFragmentDoc}`;
export const UserProfileDataFragmentDoc = gql`
    fragment UserProfileData on Profile {
  userSlug
  name
  avatar
  description
  location {
    placeId
    main
    secondary
    lat
    lng
  }
}
    `;
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
export const AddQuoteDocument = gql`
    mutation AddQuote($inquiryId: String!, $price: CurrencyAmountFormData!) {
  addQuote(inquiryId: $inquiryId, price: $price) {
    ...PriceQuoteData
  }
}
    ${PriceQuoteDataFragmentDoc}`;

/**
 * __useAddQuoteMutation__
 *
 * To run a mutation, you first call `useAddQuoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddQuoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addQuoteMutation, { data, loading, error }] = useAddQuoteMutation({
 *   variables: {
 *      inquiryId: // value for 'inquiryId'
 *      price: // value for 'price'
 *   },
 * });
 */
export function useAddQuoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddQuoteMutation, AddQuoteMutationVariables>) {
        return ApolloReactHooks.useMutation<AddQuoteMutation, AddQuoteMutationVariables>(AddQuoteDocument, baseOptions);
      }
export type AddQuoteMutationHookResult = ReturnType<typeof useAddQuoteMutation>;
export type AddQuoteMutationResult = ApolloReactCommon.MutationResult<AddQuoteMutation>;
export type AddQuoteMutationOptions = ApolloReactCommon.BaseMutationOptions<AddQuoteMutation, AddQuoteMutationVariables>;
export const BookmarkInquiryDocument = gql`
    mutation BookmarkInquiry($inquiryId: String!, $bookmark: Boolean!) {
  bookmarkInquiry(inquiryId: $inquiryId, bookmark: $bookmark)
}
    `;

/**
 * __useBookmarkInquiryMutation__
 *
 * To run a mutation, you first call `useBookmarkInquiryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBookmarkInquiryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bookmarkInquiryMutation, { data, loading, error }] = useBookmarkInquiryMutation({
 *   variables: {
 *      inquiryId: // value for 'inquiryId'
 *      bookmark: // value for 'bookmark'
 *   },
 * });
 */
export function useBookmarkInquiryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<BookmarkInquiryMutation, BookmarkInquiryMutationVariables>) {
        return ApolloReactHooks.useMutation<BookmarkInquiryMutation, BookmarkInquiryMutationVariables>(BookmarkInquiryDocument, baseOptions);
      }
export type BookmarkInquiryMutationHookResult = ReturnType<typeof useBookmarkInquiryMutation>;
export type BookmarkInquiryMutationResult = ApolloReactCommon.MutationResult<BookmarkInquiryMutation>;
export type BookmarkInquiryMutationOptions = ApolloReactCommon.BaseMutationOptions<BookmarkInquiryMutation, BookmarkInquiryMutationVariables>;
export const CreateInquiryDocument = gql`
    mutation CreateInquiry($title: String!, $description: String!, $location: LocationFormData!, $category: Category!) {
  createInquiry(title: $title, description: $description, location: $location, category: $category) {
    ...InquiryData
  }
}
    ${InquiryDataFragmentDoc}`;

/**
 * __useCreateInquiryMutation__
 *
 * To run a mutation, you first call `useCreateInquiryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInquiryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInquiryMutation, { data, loading, error }] = useCreateInquiryMutation({
 *   variables: {
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      location: // value for 'location'
 *      category: // value for 'category'
 *   },
 * });
 */
export function useCreateInquiryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateInquiryMutation, CreateInquiryMutationVariables>) {
        return ApolloReactHooks.useMutation<CreateInquiryMutation, CreateInquiryMutationVariables>(CreateInquiryDocument, baseOptions);
      }
export type CreateInquiryMutationHookResult = ReturnType<typeof useCreateInquiryMutation>;
export type CreateInquiryMutationResult = ApolloReactCommon.MutationResult<CreateInquiryMutation>;
export type CreateInquiryMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateInquiryMutation, CreateInquiryMutationVariables>;
export const DeleteInquiryDocument = gql`
    mutation DeleteInquiry($inquiryId: String!) {
  deleteInquiry(inquiryId: $inquiryId)
}
    `;

/**
 * __useDeleteInquiryMutation__
 *
 * To run a mutation, you first call `useDeleteInquiryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInquiryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInquiryMutation, { data, loading, error }] = useDeleteInquiryMutation({
 *   variables: {
 *      inquiryId: // value for 'inquiryId'
 *   },
 * });
 */
export function useDeleteInquiryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteInquiryMutation, DeleteInquiryMutationVariables>) {
        return ApolloReactHooks.useMutation<DeleteInquiryMutation, DeleteInquiryMutationVariables>(DeleteInquiryDocument, baseOptions);
      }
export type DeleteInquiryMutationHookResult = ReturnType<typeof useDeleteInquiryMutation>;
export type DeleteInquiryMutationResult = ApolloReactCommon.MutationResult<DeleteInquiryMutation>;
export type DeleteInquiryMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteInquiryMutation, DeleteInquiryMutationVariables>;
export const RemoveQuoteDocument = gql`
    mutation RemoveQuote($inquiryId: String!, $quoteDate: DateTime!) {
  removeQuote(inquiryId: $inquiryId, quoteDate: $quoteDate) {
    ...PriceQuoteData
  }
}
    ${PriceQuoteDataFragmentDoc}`;

/**
 * __useRemoveQuoteMutation__
 *
 * To run a mutation, you first call `useRemoveQuoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveQuoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeQuoteMutation, { data, loading, error }] = useRemoveQuoteMutation({
 *   variables: {
 *      inquiryId: // value for 'inquiryId'
 *      quoteDate: // value for 'quoteDate'
 *   },
 * });
 */
export function useRemoveQuoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RemoveQuoteMutation, RemoveQuoteMutationVariables>) {
        return ApolloReactHooks.useMutation<RemoveQuoteMutation, RemoveQuoteMutationVariables>(RemoveQuoteDocument, baseOptions);
      }
export type RemoveQuoteMutationHookResult = ReturnType<typeof useRemoveQuoteMutation>;
export type RemoveQuoteMutationResult = ApolloReactCommon.MutationResult<RemoveQuoteMutation>;
export type RemoveQuoteMutationOptions = ApolloReactCommon.BaseMutationOptions<RemoveQuoteMutation, RemoveQuoteMutationVariables>;
export const UpdateInquiryDocument = gql`
    mutation UpdateInquiry($inquiryId: String!, $title: String!, $description: String!, $location: LocationFormData!, $category: Category!) {
  updateInquiry(inquiryId: $inquiryId, title: $title, description: $description, location: $location, category: $category) {
    ...InquiryData
  }
}
    ${InquiryDataFragmentDoc}`;

/**
 * __useUpdateInquiryMutation__
 *
 * To run a mutation, you first call `useUpdateInquiryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInquiryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInquiryMutation, { data, loading, error }] = useUpdateInquiryMutation({
 *   variables: {
 *      inquiryId: // value for 'inquiryId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      location: // value for 'location'
 *      category: // value for 'category'
 *   },
 * });
 */
export function useUpdateInquiryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateInquiryMutation, UpdateInquiryMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateInquiryMutation, UpdateInquiryMutationVariables>(UpdateInquiryDocument, baseOptions);
      }
export type UpdateInquiryMutationHookResult = ReturnType<typeof useUpdateInquiryMutation>;
export type UpdateInquiryMutationResult = ApolloReactCommon.MutationResult<UpdateInquiryMutation>;
export type UpdateInquiryMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateInquiryMutation, UpdateInquiryMutationVariables>;
export const InquiriesDocument = gql`
    query Inquiries {
  allInquiries {
    ...InquiryData
  }
}
    ${InquiryDataFragmentDoc}`;

/**
 * __useInquiriesQuery__
 *
 * To run a query within a React component, call `useInquiriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInquiriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInquiriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useInquiriesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<InquiriesQuery, InquiriesQueryVariables>) {
        return ApolloReactHooks.useQuery<InquiriesQuery, InquiriesQueryVariables>(InquiriesDocument, baseOptions);
      }
export function useInquiriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<InquiriesQuery, InquiriesQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<InquiriesQuery, InquiriesQueryVariables>(InquiriesDocument, baseOptions);
        }
export type InquiriesQueryHookResult = ReturnType<typeof useInquiriesQuery>;
export type InquiriesLazyQueryHookResult = ReturnType<typeof useInquiriesLazyQuery>;
export type InquiriesQueryResult = ApolloReactCommon.QueryResult<InquiriesQuery, InquiriesQueryVariables>;
export const CreateProductDocument = gql`
    mutation CreateProduct($name: String!, $description: String!, $price: CurrencyAmountFormData, $tags: [String!]) {
  createProduct(name: $name, description: $description, price: $price, tags: $tags) {
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
 *      description: // value for 'description'
 *      price: // value for 'price'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useCreateProductMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateProductMutation, CreateProductMutationVariables>) {
        return ApolloReactHooks.useMutation<CreateProductMutation, CreateProductMutationVariables>(CreateProductDocument, baseOptions);
      }
export type CreateProductMutationHookResult = ReturnType<typeof useCreateProductMutation>;
export type CreateProductMutationResult = ApolloReactCommon.MutationResult<CreateProductMutation>;
export type CreateProductMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateProductMutation, CreateProductMutationVariables>;
export const DeleteProductDocument = gql`
    mutation DeleteProduct($productId: String!) {
  deleteProduct(productId: $productId)
}
    `;

/**
 * __useDeleteProductMutation__
 *
 * To run a mutation, you first call `useDeleteProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProductMutation, { data, loading, error }] = useDeleteProductMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *   },
 * });
 */
export function useDeleteProductMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteProductMutation, DeleteProductMutationVariables>) {
        return ApolloReactHooks.useMutation<DeleteProductMutation, DeleteProductMutationVariables>(DeleteProductDocument, baseOptions);
      }
export type DeleteProductMutationHookResult = ReturnType<typeof useDeleteProductMutation>;
export type DeleteProductMutationResult = ApolloReactCommon.MutationResult<DeleteProductMutation>;
export type DeleteProductMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteProductMutation, DeleteProductMutationVariables>;
export const UpdateProductDocument = gql`
    mutation UpdateProduct($productId: String!, $name: String!, $description: String!, $price: CurrencyAmountFormData, $tags: [String!]) {
  updateProduct(productId: $productId, name: $name, description: $description, price: $price, tags: $tags) {
    ...ProductData
  }
}
    ${ProductDataFragmentDoc}`;

/**
 * __useUpdateProductMutation__
 *
 * To run a mutation, you first call `useUpdateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProductMutation, { data, loading, error }] = useUpdateProductMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      price: // value for 'price'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useUpdateProductMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateProductMutation, UpdateProductMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateProductMutation, UpdateProductMutationVariables>(UpdateProductDocument, baseOptions);
      }
export type UpdateProductMutationHookResult = ReturnType<typeof useUpdateProductMutation>;
export type UpdateProductMutationResult = ApolloReactCommon.MutationResult<UpdateProductMutation>;
export type UpdateProductMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateProductMutation, UpdateProductMutationVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($name: String!, $location: LocationFormData) {
  createProject(name: $name, location: $location) {
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
 *      location: // value for 'location'
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
    mutation UpdateProject($projectSlug: String!, $name: String!, $location: LocationFormData) {
  updateProject(projectSlug: $projectSlug, name: $name, location: $location) {
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
 *      location: // value for 'location'
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
export const ChangeEmailDocument = gql`
    mutation ChangeEmail($email: String!) {
  changeEmail(email: $email)
}
    `;

/**
 * __useChangeEmailMutation__
 *
 * To run a mutation, you first call `useChangeEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeEmailMutation, { data, loading, error }] = useChangeEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useChangeEmailMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChangeEmailMutation, ChangeEmailMutationVariables>) {
        return ApolloReactHooks.useMutation<ChangeEmailMutation, ChangeEmailMutationVariables>(ChangeEmailDocument, baseOptions);
      }
export type ChangeEmailMutationHookResult = ReturnType<typeof useChangeEmailMutation>;
export type ChangeEmailMutationResult = ApolloReactCommon.MutationResult<ChangeEmailMutation>;
export type ChangeEmailMutationOptions = ApolloReactCommon.BaseMutationOptions<ChangeEmailMutation, ChangeEmailMutationVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}
    `;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      currentPassword: // value for 'currentPassword'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        return ApolloReactHooks.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, baseOptions);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = ApolloReactCommon.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const ChangeProfileSettingsDocument = gql`
    mutation ChangeProfileSettings($hidden: Boolean!) {
  changeProfileSettings(hidden: $hidden)
}
    `;

/**
 * __useChangeProfileSettingsMutation__
 *
 * To run a mutation, you first call `useChangeProfileSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeProfileSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeProfileSettingsMutation, { data, loading, error }] = useChangeProfileSettingsMutation({
 *   variables: {
 *      hidden: // value for 'hidden'
 *   },
 * });
 */
export function useChangeProfileSettingsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChangeProfileSettingsMutation, ChangeProfileSettingsMutationVariables>) {
        return ApolloReactHooks.useMutation<ChangeProfileSettingsMutation, ChangeProfileSettingsMutationVariables>(ChangeProfileSettingsDocument, baseOptions);
      }
export type ChangeProfileSettingsMutationHookResult = ReturnType<typeof useChangeProfileSettingsMutation>;
export type ChangeProfileSettingsMutationResult = ApolloReactCommon.MutationResult<ChangeProfileSettingsMutation>;
export type ChangeProfileSettingsMutationOptions = ApolloReactCommon.BaseMutationOptions<ChangeProfileSettingsMutation, ChangeProfileSettingsMutationVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($name: String, $description: String, $location: LocationFormData, $avatar: Upload, $removeCurrentAvatar: Boolean) {
  updateProfile(name: $name, description: $description, location: $location, avatar: $avatar, removeCurrentAvatar: $removeCurrentAvatar) {
    ...UserProfileData
  }
}
    ${UserProfileDataFragmentDoc}`;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      location: // value for 'location'
 *      avatar: // value for 'avatar'
 *      removeCurrentAvatar: // value for 'removeCurrentAvatar'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, baseOptions);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = ApolloReactCommon.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
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
export const ProfileDocument = gql`
    query Profile($userSlug: String!) {
  profile(userSlug: $userSlug) {
    ...UserProfileData
  }
}
    ${UserProfileDataFragmentDoc}`;

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *      userSlug: // value for 'userSlug'
 *   },
 * });
 */
export function useProfileQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
        return ApolloReactHooks.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, baseOptions);
      }
export function useProfileLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, baseOptions);
        }
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileQueryResult = ApolloReactCommon.QueryResult<ProfileQuery, ProfileQueryVariables>;