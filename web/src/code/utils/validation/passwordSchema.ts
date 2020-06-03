import * as Yup from 'yup';
import { TFunction } from 'i18next';


export function createPasswordSchema(t: TFunction) {
    return Yup.string()
        .min(6, t('form.password.validation.tooShort'))
        .max(50, t('form.password.validation.tooLong'))
        .required(t('form.password.validation.required'));
}
