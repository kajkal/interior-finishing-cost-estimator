import { atom } from 'recoil/dist';


export const sideNavAtom = atom<boolean>({
    key: 'sideNavAtom',
    default: restoreSideNavAtomState(),
});


export function restoreSideNavAtomState(): boolean {
    return localStorage.getItem('sideNav') === 'true';
}

export function saveSideNavAtomState(isSideNavOpen: boolean): void {
    localStorage.setItem('sideNav', JSON.stringify(isSideNavOpen));
}
