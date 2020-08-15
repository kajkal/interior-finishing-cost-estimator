import { registerEnumType } from 'type-graphql';


export enum Category {
    ELECTRICAL = 'ELECTRICAL',
    PIPING = 'PIPING',
    INTERIOR_FINISHING = 'INTERIOR_FINISHING',
    CARPENTRY = 'CARPENTRY',
    INSTALLATION = 'INSTALLATION',
    DESIGNING = 'DESIGNING',
}

registerEnumType(Category, {
    name: 'Category',
});
