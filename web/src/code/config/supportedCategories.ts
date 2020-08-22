import { Category } from '../../graphql/generated-types';


export interface CategoryConfig {
    tKey: string;
}

export const categoryConfigMap: Record<Category, CategoryConfig> = {
    [ Category.ELECTRICAL ]: {
        tKey: 'inquiry.categories.electrical',
    },
    [ Category.PIPING ]: {
        tKey: 'inquiry.categories.piping',
    },
    [ Category.INTERIOR_FINISHING ]: {
        tKey: 'inquiry.categories.interiorFinishing',
    },
    [ Category.CARPENTRY ]: {
        tKey: 'inquiry.categories.carpentry',
    },
    [ Category.INSTALLATION ]: {
        tKey: 'inquiry.categories.installation',
    },
    [ Category.DESIGNING ]: {
        tKey: 'inquiry.categories.designing',
    },
};

export const supportedCategories = Object.keys(Category) as Category[];
