/// <reference path="../cypress.d.ts" />


context('Login page', () => {

    before(() => {
        cy.task('db:clear');
    });

    beforeEach(() => {
        cy.visit('/');
    });

    it('should have forgot password page link', () => {
        cy.get('a[href="/login/forgot-password"]')
            .should('be.visible')
            .contains('Forgot password?');
    });

    it('should have signup page link', () => {
        cy.get('a[href="/signup"]')
            .should('be.visible')
            .contains('Don\'t have an account? Sign up');
    });

    it('should successfully login', () => {
        // create user
        cy.task('db:populateWithUser').as('user');

        // request protected page
        cy.visit('/profile');

        // verify if navigation to login page occurred and warning alert is visible
        cy.location('pathname').should('eq', '/login');
        cy.get('[role=alert]')
            .should('be.visible')
            .and('contain.text', 'Authorization required, log in and try again')
            .and('have.attr', 'class')
            .and('match', /warning/i); // alert should be warning type

        // capture snapshot
        cy.document().toMatchImageSnapshot({
            name: 'login page - not authenticated error',
        });

        // fill log in form with correct credentials
        cy.get<UserCompleteData>('@user').then((userData) => {
            cy.get('input[name=email]').type(userData.email);
            cy.get('input[name=password]').type(userData.unencryptedPassword);
            cy.get('[type=submit]').click();
        });

        // verify if navigation to initially requested protected page occurred
        cy.get<UserCompleteData>('@user').then((userData) => {
            cy.get('main').contains(userData.name).should('be.visible');
        });
        cy.location('pathname').should('eq', '/profile');

        // verify if refresh token cookie is present
        cy.getCookie('rt')
            .should('exist')
            .and('have.property', 'httpOnly', true);

        // verify if user session is persistent after refresh
        cy.reload(true);
        cy.get<UserCompleteData>('@user').then((userData) => {
            cy.get('main').contains(userData.name).should('be.visible');
        });
        cy.location('pathname').should('eq', '/profile');
    });

    it('should display bad credentials error', () => {
        // create user
        cy.task('db:populateWithUser', { email: 'email_for_bad_credentials_error@domain.com' }).as('user');

        // fill log in form with wrong credentials
        cy.get<UserCompleteData>('@user').then((userData) => {
            cy.get('input[name=email]').type(userData.email);
            cy.get('input[name=password]').type('wrong password');
            cy.get('[type=submit]').click();
        });

        // verify if error alert is visible
        cy.get('[role=alert]')
            .should('be.visible')
            .and('contain.text', 'Bad email or password')
            .and('have.attr', 'class')
            .and('match', /error/i); // alert should be error type

        // capture snapshot
        cy.document().toMatchImageSnapshot({
            name: 'login page - bad credentials error',
        });
    });

});
