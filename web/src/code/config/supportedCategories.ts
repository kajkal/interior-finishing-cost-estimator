import { Category } from '../../graphql/generated-types';


export const categoryTranslationKeyMap: Record<Category, string> = {
    [Category.ELECTRICAL]: 'inquiry.categories.electrical',
    [Category.PIPING]: 'inquiry.categories.piping',
    [Category.INTERIOR_FINISHING]: 'inquiry.categories.interiorFinishing',
    [Category.CARPENTRY]: 'inquiry.categories.carpentry',
    [Category.INSTALLATION]: 'inquiry.categories.installation',
    [Category.DESIGNING]: 'inquiry.categories.designing',
};

export const supportedCategories = Object.keys(Category) as Category[];
