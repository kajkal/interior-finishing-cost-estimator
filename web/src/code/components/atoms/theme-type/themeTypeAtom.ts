import { atom } from 'recoil/dist';
import { ThemeType } from '../../../utils/theme/ThemeUtils';


export const themeTypeAtom = atom<ThemeType>({
    key: 'themeTypeAtom',
    default: restoreThemeTypeAtomState(),
});


function isThemeType(type: string | null): type is ThemeType {
    return type! in ThemeType;
}

export function restoreThemeTypeAtomState(): ThemeType {
    const themeTypeFromStorage = localStorage.getItem('theme');
    return isThemeType(themeTypeFromStorage) ? themeTypeFromStorage : ThemeType.light;
}

export function saveThemeTypeAtomState(themeType: ThemeType): void {
    localStorage.setItem('theme', themeType);
}
