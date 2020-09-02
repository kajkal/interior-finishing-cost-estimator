import { sign } from 'jsonwebtoken';
import 'cypress-plugin-snapshots/commands';
import 'cypress-file-upload';


Cypress.Commands.add('login', (userData: UserData) => {
    const token = sign({ sub: userData.id }, 'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE', { expiresIn: '7d' });
    cy.setCookie('rt', token, {
        domain: 'localhost',
        httpOnly: true,
        path: '/refresh_token',
        sameSite: 'strict',
    });
});

Cypress.Commands.add('getEditor', (selector: string) => {
    return cy.get(selector)
        .click();
});

Cypress.Commands.add('typeInSlate', { prevSubject: true }, (subject: HTMLElement, text: string) => {
    return cy.wrap(subject)
        .then((subject) => {
            subject[ 0 ].dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: text }));
            return subject;
        });
});

Cypress.Commands.add('clearInSlate', { prevSubject: true }, (subject: HTMLElement) => {
    return cy.wrap(subject)
        .then((subject) => {
            subject[ 0 ].dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteHardLineBackward' }));
            return subject;
        });
});
