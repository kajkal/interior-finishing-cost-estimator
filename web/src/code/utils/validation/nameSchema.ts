import * as Yup from 'yup';
import { TFunction } from 'i18next';


export function createNameSchema(t: TFunction) {
    return Yup.string()
        .min(3, t('form.name.validation.tooShort'))
        .max(50, t('form.name.validation.tooLong'))
        .required(t('form.name.validation.required'));
}
