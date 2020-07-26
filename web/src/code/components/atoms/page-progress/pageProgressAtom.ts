import { atom } from 'recoil/dist';


export const pageProgressAtom = atom<boolean>({
    key: 'pageProgressAtom',
    default: false,
});
