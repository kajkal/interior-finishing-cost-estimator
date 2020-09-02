/// <reference types="cypress" />

import { initPlugin } from 'cypress-plugin-snapshots/plugin';

import { TestDatabaseManager, UserData } from '../../server/tests/__utils__/integration-utils/TestDatabaseManager';
import { User } from '../../server/src/entities/user/User';


/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    initPlugin(on, config);

    on('task', {

        'db:clear': async () => {
            const db = await TestDatabaseManager.connect(config.env.mongodbUrl);
            await db.clear();
            await db.disconnect();
            return true;
        },

        'db:populateWithUser': async (partialUserData?: Partial<UserData>): Promise<User & { unencryptedPassword: string }> => {
            const db = await TestDatabaseManager.connect(config.env.mongodbUrl);
            const user = await db.populateWithUser(partialUserData);
            await db.disconnect();
            return user;
        },

    });
};
