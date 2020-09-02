/// <reference path="../cypress.d.ts" />


context('Profile page', () => {

    before(() => {
        cy.task('db:clear');
    });

    beforeEach(() => {
        cy.task('db:populateWithUser', { name: 'Profile Page Tester' }).as('user');
        cy.get<UserData>('@user').then((userData) => {
            cy.login(userData);
        });
        cy.visit('/');
    });

    it('should display user profile page', () => {
        cy.location('pathname').should('eq', '/profile');

        // verify profile edit button
        cy.get('main').get('button[title="Edit your profile"]').should('be.visible');

        // verify user name
        cy.get('main').contains('Profile Page Tester').should('be.visible');

        // verify default profile description
        cy.get('main').contains('Hello, I\'m Profile Page Tester and I haven\'t updated my profile yet!').should('be.visible');
    });

    it('should display user public profile page', () => {
        cy.get<UserData>('@user').then((userData) => {
            // visit user' public profile page
            cy.visit(`/${userData.slug}`);

            // verify profile edit button
            cy.get('main').get('button[title="Edit your profile"]').should('not.be.visible');

            // verify user name
            cy.get('main').contains('Profile Page Tester').should('be.visible');

            // verify default profile description
            cy.get('main').contains('Hello, I\'m Profile Page Tester and I haven\'t updated my profile yet!').should('be.visible');
        });
    });

    it('should successfully edit profile', () => {
        cy.fixture('images/avatar.png').as('avatar');

        cy.get<UserData>('@user').then((userData) => {
            // open profile update modal
            cy.get('main').get('button[title="Edit your profile"]').click();

            // fill form
            cy.get('input[name=name]')
                .should('have.value', userData.name);
            cy.get('input[name=avatar]')
                .attachFile('images/avatar.png');
            cy.getEditor('[role="textbox"][name=description]')
                .typeInSlate('Sample description');
            cy.get('input[name=location]')
                .type('Krakow');
            cy.get('[role=option')
                .contains('KrakówPoland')
                .click();

            // capture snapshot
            cy.get('[role=dialog]').toMatchImageSnapshot({
                name: 'profile page - filled edit profile form',
            });

            cy.get('[type=button]').contains('Edit').click();

            // verify profile description
            cy.get('main').contains('Sample description').should('be.visible');

            // verify if avatar is visible
            cy.get('main').get('img[alt="Profile Page Tester"]')
                .should('be.visible')
                .and(($img) => {
                    expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
                });

            // capture snapshot
            cy.document().toMatchImageSnapshot({
                name: 'profile page - updated profile page',
            });
        });
    });

});
