import { ValidationError } from 'class-validator';


export interface ValidationTestData<Data> {
    data: Data;
    expectedErrors: ValidationError['constraints'][];
}
