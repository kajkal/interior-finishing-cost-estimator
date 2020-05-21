import * as Yup from 'yup';


export const nameSchema = Yup.string()
    .min(3, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required');
