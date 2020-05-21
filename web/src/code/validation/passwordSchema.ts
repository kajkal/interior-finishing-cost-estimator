import * as Yup from 'yup';


export const passwordSchema = Yup.string()
    .min(6, 'Password is too short')
    .max(50, 'Password is too long')
    // .matches(/(?=.*?[A-Z])/, 'Use at least one upper case letter')
    .required('Password is required');
