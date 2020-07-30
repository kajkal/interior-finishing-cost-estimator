import { renderHook } from '@testing-library/react-hooks';

import { setWindowWidth } from '../../__utils__/setWindowWidth';

import { useMobileDetect } from '../../../code/utils/hooks/useMobileDetect';


describe('useMobileDetect hook', () => {

    it('should return true when is on mobile device', () => {
        setWindowWidth(414);
        const { result } = renderHook(useMobileDetect);
        expect(result.current).toBe(true);
    });

    it('should return false when is not on mobile device', () => {
        setWindowWidth(800);
        const { result } = renderHook(useMobileDetect);
        expect(result.current).toBe(false);
    });

});
