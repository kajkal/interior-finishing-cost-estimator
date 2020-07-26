import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../pages/login/LoginPage';
import { SignupPage } from '../pages/signup/SignupPage';
import { LogoutPage } from '../pages/logout/LogoutPage';
import { ConfirmEmailAddressPage } from '../pages/confirm-email-address/ConfirmEmailAddressPage';
import { PasswordResetRequestPage } from '../pages/password-reset/PasswordResetRequestPage';
import { PasswordResetPage } from '../pages/password-reset/PasswordResetPage';
import { InquiriesPage } from '../pages/inquiries/InquiriesPage';
import { AuthorizedUserProfilePage } from '../pages/profile/AuthorizedUserProfilePage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProjectPage } from '../pages/project/ProjectPage';
import { PageNotFound } from '../pages/not-found/PageNotFound';
import { UserProfilePage } from '../pages/profile/UserProfilePage';

import { ProtectedRoute } from './protected/ProtectedRoute';
import { navMap } from '../../config/nav';


export function Navigator(): React.ReactElement {
    return (
        <div>
            <Routes>

                <Route path={navMap.home} element={<LoginPage />} />

                <Route path={navMap.login} element={<LoginPage />} />
                <Route path={navMap.signup} element={<SignupPage />} />
                <ProtectedRoute path={navMap.logout} element={<LogoutPage />} silent />

                <Route path={navMap.confirmEmailAddress} element={<ConfirmEmailAddressPage />} />
                <Route path={navMap.forgotPassword} element={<PasswordResetRequestPage />} />
                <Route path={navMap.passwordReset} element={<PasswordResetPage />} />
                <Route path={navMap.inquiries} element={<InquiriesPage />} />

                <ProtectedRoute path={navMap.profile} element={<AuthorizedUserProfilePage />} />
                <ProtectedRoute path={navMap.settings} element={<SettingsPage />} />
                <ProtectedRoute path={navMap.products} element={<ProductsPage />} />
                <ProtectedRoute path={navMap.projects + '/:projectSlug'} element={<ProjectPage />} />

                <Route path=':userSlug' element={<UserProfilePage />} />
                <Route path='*' element={<PageNotFound />} />

            </Routes>
        </div>
    );
}
