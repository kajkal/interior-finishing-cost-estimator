/// <reference path="../cypress.d.ts" />


context('Logout page', () => {

    before(() => {
        cy.task('db:clear');
    });

    beforeEach(() => {
        cy.task('db:populateWithUser').as('user');
        cy.get<UserData>('@user').then((userData) => {
            cy.login(userData);
        });
        cy.visit('/');
    });

    it('should successfully logout', () => {
        // verify if profile page is visible
        cy.get<UserData>('@user').then((userData) => {
            cy.get('main').contains(userData.name).should('be.visible');
            cy.location('pathname').should('eq', '/profile');
        });

        // visit logout page
        cy.visit('/logout');

        // verify if navigation to login page occurred
        cy.get('main').contains('Log in').should('be.visible');
        cy.location('pathname').should('eq', '/login');

        // verify if refresh token cookie was invalidated
        cy.getCookie('rt').should('not.exist');
    });

});
