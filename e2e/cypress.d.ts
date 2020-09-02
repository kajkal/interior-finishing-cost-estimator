/// <reference types="cypress" />


interface UserData {
    id: string;
    email: string;
    name: string;
    slug: string;
}

interface UserCompleteData extends UserData {
    unencryptedPassword: string;
}

declare namespace Cypress {

    interface TasksMap {
        'db:clear': { arg: undefined; result: true; };
        'db:populateWithUser': { arg: Partial<UserData>, result: UserCompleteData };
    }

    interface Chainable<Subject = any> {

        /**
         * @example cy.getEditor([role="textbox"][name=description]);
         */
        getEditor(selector: string): Chainable<HTMLElement>;

        /**
         * @example cy.typeInSlate('hello world!');
         */
        typeInSlate(text: string): Chainable<HTMLElement>;

        /**
         * @example cy.clearInSlate();
         */
        clearInSlate(): Chainable<HTMLElement>;

        /**
         * @example cy.login(user.id);
         */
        login(userData: UserData): Chainable<unknown>;

        /**
         * @example cy.document().toMatchImageSnapshot();
         */
        toMatchImageSnapshot(options?: { name?: string; }): Chainable<unknown>;

        /**
         * @example cy.task('db:clear');
         */
        task<K extends keyof TasksMap>(type: K, arg?: TasksMap[K]['arg'], options?: Partial<Loggable & Timeoutable>): Chainable<TasksMap[K]['result']>;

    }

}
