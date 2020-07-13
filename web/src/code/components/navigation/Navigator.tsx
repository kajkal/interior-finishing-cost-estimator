import React from 'react';
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';

import { LoginPage } from '../pages/login/LoginPage';
import { SignupPage } from '../pages/signup/SignupPage';
import { LogoutPage } from '../pages/logout/LogoutPage';
import { ConfirmEmailAddressPage } from '../pages/confirm-email-address/ConfirmEmailAddressPage';
import { PasswordResetRequestPage } from '../pages/password-reset/PasswordResetRequestPage';
import { PasswordResetPage } from '../pages/password-reset/PasswordResetPage';
import { InquiriesPage } from '../pages/inquiries/InquiriesPage';
import { AuthorizedUserProfilePage } from '../pages/profile/AuthorizedUserProfilePage';
import { AccountPage } from '../pages/account/AccountPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProjectPage } from '../pages/project/ProjectPage';
import { PageNotFound } from '../pages/not-found/PageNotFound';
import { UserProfilePage } from '../pages/profile/UserProfilePage';

import { ProtectedRoute } from '../common/router/ProtectedRoute';
import { useUserData } from '../../utils/hooks/useUserData';
import { useToast } from '../providers/toast/useToast';
import { nav, navMap } from '../../config/nav';


export function Navigator(): React.ReactElement {
    const { userData, isLoggedIn } = useUserData();

    return (
        <div>
            <Routes>

                <Route path={navMap.home} element={<LoginPage />} />

                <Route path={navMap.login} element={<LoginPage />} />
                <Route path={navMap.signup} element={<SignupPage />} />
                <ProtectedRoute path={navMap.logout} element={<LogoutPage />} isUserLoggedIn={isLoggedIn} silent />

                <Route path={navMap.confirmEmailAddress} element={<ConfirmEmailAddressPage />} />
                <Route path={navMap.forgotPassword} element={<PasswordResetRequestPage />} />
                <Route path={navMap.passwordReset} element={<PasswordResetPage />} />
                <Route path={navMap.inquiries} element={<InquiriesPage />} />

                <ProtectedRoute path={userData?.slug} element={<Outlet />} isUserLoggedIn={isLoggedIn}>
                    <Route path={navMap.user.profile} element={<AuthorizedUserProfilePage />} />
                    <Route path={navMap.user.account} element={<AccountPage />} />
                    <Route path={navMap.user.products} element={<ProductsPage />} />
                    <Route path={navMap.user.projects + '/:projectSlug'} element={<ProjectPage />} />
                    <Route path='*' element={<PageNotFound />} />
                </ProtectedRoute>

                <Route path=':userSlug' element={<Outlet />}>
                    <Route path={navMap.user.profile} element={<UserProfilePage />} />
                    <Route path='*' element={<HandleNotFoundOtherUserPageRequest />} />
                </Route>

                <Route path='*' element={<PageNotFound />} />

            </Routes>
        </div>
    );
}


/**
 * Redirects user to publicly available requested user profile.
 * Eg.
 *   authorized user slug: 'sample-user'
 *   requested page: '/other-user/products'
 *   result: 'sample-user' is redirected to page '/other-user' with publicly available 'other-user' profile
 */
function HandleNotFoundOtherUserPageRequest(): React.ReactElement {
    const { userSlug } = useParams();
    const { warningToast } = useToast();

    React.useEffect(() => {
        warningToast(({ t }) => t('notFoundPage.pageNotFound'));
    }, [ warningToast ]);

    return <Navigate to={nav.user(userSlug).profile()} replace />;
}
