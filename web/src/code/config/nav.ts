/**
 * App navigation map:
 *
 *   / - home page
 *   /login - login page
 *   /signup - signup page
 *   /logout - logout page
 *   /confirm-email-address - confirm email address page
 *   /forgot-password - forgot password page
 *   /reset-password - reset password page
 *   /inquiries - inquiries page
 *
 *   /profile - authorized user profile page
 *   /settings - authorized user settings page
 *   /products - authorized user products page
 *   /create-project - authorized user create new project page
 *   /projects/:projectSlug - authorized user projects page
 *
 *   /:userSlug/ - every other user' public profile page
 */
export const navMap = {
    home: '/',
    login: '/login',
    signup: '/signup',
    logout: '/logout',
    confirmEmailAddress: '/signup/confirm-email-address',
    forgotPassword: '/login/forgot-password',
    passwordReset: '/login/reset-password',
    inquiries: '/inquiries',

    profile: '/profile',
    settings: '/settings',
    products: '/products',
    createProject: '/create-project',
    projects: '/projects',

    // public user data
    user: {
        profile: '/',
    },
} as const;


/**
 * Navigation paths generator.
 */
export const nav = {
    home: () => navMap.home,
    login: () => navMap.login,
    signup: () => navMap.signup,
    logout: () => navMap.logout,
    confirmEmailAddress: () => navMap.confirmEmailAddress,
    forgotPassword: () => navMap.forgotPassword,
    passwordReset: () => navMap.passwordReset,
    inquiries: () => navMap.inquiries,

    profile: () => navMap.profile,
    settings: () => navMap.settings,
    products: () => navMap.products,
    createProject: () => navMap.createProject,
    project: (projectSlug: string) => navMap.projects + '/' + projectSlug,

    user: (userSlug: string) => ({
        profile: () => '/' + userSlug + navMap.user.profile,
    }),
} as const;
