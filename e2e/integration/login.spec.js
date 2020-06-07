/// <reference types="cypress" />

context('Login page', () => {

    beforeEach(() => {
        cy.task('clear:db')
        cy.visit('/')
    })

    it('should navigate to new page on forgot password link click', () => {
        // verify if navigation to 'forgot password' page works
        cy.contains('Forgot password?').click()
        cy.location('pathname').should('eq', '/forgot-password')
    })

    it('should navigate to new page on sign up link click', () => {
        // verify if navigation to 'sign up' password' page works
        cy.contains('Don\'t have an account? Sign Up').click()
        cy.location('pathname').should('eq', '/signup')
    })

    it('should successfully login and logout', () => {
        // load user data
        cy.fixture('users/user.json').as('userData')

        // add user data record to db
        cy.get('@userData').then(({ dbRecord }) => {
            cy.task('seed:db', dbRecord)
        })

        // request protected page
        cy.visit('/projects')

        // verify if navigation to login page occurred and warning alert is visible
        cy.location('pathname').should('eq', '/login')
        cy.get('[role=alert]')
            .should('be.visible')
            .and('contain.text', 'Authorization required, log in and try again')
            .and('have.attr', 'class')
            .and('match', /warning/i) // alert should be warning type

        // fill log in form with correct credentials
        cy.get('@userData').then(({ credentials }) => {
            cy.get('input[name=email]').type(credentials.email)
            cy.get('input[name=password]').type(credentials.password)
            cy.get('[type=submit]').click()
        })

        // verify if navigation to initially requested protected page occurred
        cy.location('pathname').should('eq', '/projects')

        // verify if refresh token cookie is present
        cy.getCookie('rt').should('have.property', 'httpOnly', true)

        // verify if user session is persistent after refresh
        cy.reload(true);
        cy.location('pathname').should('eq', '/projects')
        // TODO verify is protected page content is loaded

        // logout
        cy.visit('/logout')

        // verify if navigation to login page occurred and refresh token cookie is no longer present
        cy.location('pathname').should('eq', '/login')
        cy.getCookie('rt').should('not.exist')

        // verify if protected page is no longer accessible
        cy.visit('/projects')
        cy.location('pathname').should('eq', '/login')
        cy.get('[role=alert]')
            .should('be.visible')
            .and('contain.text', 'Authorization required, log in and try again')
            .and('have.attr', 'class')
            .and('match', /warning/i) // alert should be warning type
    })

    it('should display error about bad credentials', () => {
        // verify log in form submit button
        cy.get('[type=submit]').contains('Log in')

        // fill log in form with wrong credentials
        cy.get('input[name=email]').type('not.existing.user@domain.com')
        cy.get('input[name=password]').type('Password')
        cy.get('[type=submit]').click()

        // verify log in form submit button when waiting for response
        cy.get('[type=submit]')
            .should('be.disabled')
            .should('not.have.value', 'Log in')
            .find('[role=progressbar]')
            .should('be.visible') // should contains spinner

        // verify if error alert is visible
        cy.get('[role=alert]').should('be.visible')
        cy.get('[role=alert]').contains('Bad email or password')
    })

})
