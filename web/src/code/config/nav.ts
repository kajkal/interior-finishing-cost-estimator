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
 *   /<authUserSlug>/ - authorized user profile page
 *   /<authUserSlug>/account - authorized user account page
 *   /<authUserSlug>/products - authorized user products page
 *   /<authUserSlug>/projects/:projectSlug - authorized user projects page
 *
 *   /:userSlug - every other user' public profile page
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
    user: { // '/<userSlug>'
        profile: '/',
        account: '/account',
        products: '/products',
        projects: '/projects',
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
    user: (userSlug: string) => ({
        profile: () => '/' + userSlug + navMap.user.profile,
        account: () => '/' + userSlug + navMap.user.account,
        products: () => '/' + userSlug + navMap.user.products,
        projects: (projectSlug: string) => '/' + userSlug + navMap.user.projects + '/' + projectSlug,
    }),
} as const;
