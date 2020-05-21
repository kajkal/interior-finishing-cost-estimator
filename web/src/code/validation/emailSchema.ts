import * as Yup from 'yup';


export const emailSchema = Yup.string()
    .email('Invalid email')
    .required('Email is required');
