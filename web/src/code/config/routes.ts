const HOME_URL = '/';
const LOGIN_URL = '/login';
const SIGNUP_URL = '/signup';
const FORGOT_PASSWORD_URL = '/forgot-password';
const LOGOUT_URL = '/logout';
const PROJECTS_URL = '/projects';

export const routes = {

    home(): Readonly<string> {
        return HOME_URL;
    },

    login(): Readonly<string> {
        return LOGIN_URL;
    },

    signup(): Readonly<string> {
        return SIGNUP_URL;
    },

    forgotPassword(): Readonly<string> {
        return FORGOT_PASSWORD_URL;
    },

    logout(): Readonly<string> {
        return LOGOUT_URL;
    },

    projects(): Readonly<string> {
        return PROJECTS_URL;
    },

};
