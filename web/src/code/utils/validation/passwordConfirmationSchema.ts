import { TFunction } from 'i18next';
import * as Yup from 'yup';


/**
 * Requires 'passport' field in parent schema.
 */
export function createPasswordConfirmationSchema(t: TFunction) {
    return Yup.string()
        .test('match', t('form.password.validation.passwordsNotMatch'),
            function (passwordConfirmation: string) {
                return passwordConfirmation === this.parent.password;
            });
}
