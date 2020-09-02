/// <reference path="../cypress.d.ts" />


context('Signup page', () => {

    before(() => {
        cy.task('db:clear');
    });

    beforeEach(() => {
        cy.visit('/signup');
    });

    it('should have login page link', () => {
        cy.get('a[href="/login"]')
            .should('be.visible')
            .contains('Log in instead');
    });

    it('should successfully signup', () => {
        // fill log in form with correct credentials
        cy.get('input[name=name]').type('Karol Leśniak');
        cy.get('input[name=email]').type('karolesniak@domain.com');
        cy.get('input[name=password]').type('secure password');
        cy.get('input[name=passwordConfirmation]').type('secure password');

        // capture snapshot
        cy.document().toMatchImageSnapshot({
            name: 'signup page - filled signup form',
        });

        cy.get('[type=submit]').click();

        // verify if navigation to profile page occurred
        cy.get('main').contains('Karol Leśniak').should('be.visible');
        cy.location('pathname').should('eq', '/profile');

        // verify if success alert is visible
        cy.get('[role=alert]')
            .should('be.visible')
            .and('contain.text', 'Your account has been successfully created')
            .and('have.attr', 'class')
            .and('match', /success/i); // alert should be error type

        // verify if refresh token cookie is present
        cy.getCookie('rt')
            .should('exist')
            .and('have.property', 'httpOnly', true);

        // verify if user session is persistent after refresh
        cy.reload(true);
        cy.get('main').contains('Karol Leśniak').should('be.visible');
        cy.location('pathname').should('eq', '/profile');
    });

    it('should display email not available error', () => {
        // create user
        cy.task('db:populateWithUser').as('user');

        // fill log in form with wrong credentials
        cy.get<UserCompleteData>('@user').then((userData) => {
            cy.get('input[name=name]').type('Karol Leśniak');
            cy.get('input[name=email]').type(userData.email);
            cy.get('input[name=password]').type('secure password');
            cy.get('input[name=passwordConfirmation]').type('secure password');
            cy.get('[type=submit]').click();
        });

        // verify error message
        cy.get('[type=email]')
            .should('have.attr', 'aria-invalid', 'true')
            .and('have.attr', 'aria-describedby', 'email-helper-text');
        cy.get('#email-helper-text')
            .should('be.visible')
            .and('contain.text', 'Email not available');
    });

});
