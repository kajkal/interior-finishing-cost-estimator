import * as Yup from 'yup';
import { TFunction } from 'i18next';


export function createEmailSchema(t: TFunction) {
    return Yup.string()
        .email(t('form.email.validation.invalid'))
        .required(t('form.email.validation.required'));
}
