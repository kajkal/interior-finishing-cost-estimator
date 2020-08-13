import { AssertingTestFunction } from 'yup';


export function isEqualTo(otherFieldName: string): AssertingTestFunction<string> {
    return function (value: string): value is string {
        return value === this.parent[ otherFieldName ];
    };
}
