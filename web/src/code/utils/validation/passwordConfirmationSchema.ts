import { TFunction } from 'i18next';
import * as Yup from 'yup';
import { isEqualTo } from './customAssertingTestFunctions';


/**
 * Requires 'passport' field in parent schema.
 */
export function createPasswordConfirmationSchema(t: TFunction) {
    return Yup.string()
        .test('match', t('form.newPasswordConfirmation.validation.passwordsNotMatch'), isEqualTo('password'));
}
