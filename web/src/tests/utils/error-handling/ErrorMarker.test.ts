import { ErrorMarker } from '../../../code/utils/error-handling/ErrorMarker';


describe('ErrorMarker class', () => {

    it('should mark error as handled', () => {
        // given
        const error1 = undefined;
        const error2 = new Error('Error 2');
        const error3 = new Error('Error 3');

        // when
        ErrorMarker.markAsHandledError(error2);

        // then
        expect(ErrorMarker.isUnhandledError(error1)).toBe(false);
        expect(ErrorMarker.isUnhandledError(error2)).toBe(false);
        expect(ErrorMarker.isUnhandledError(error3)).toBe(true);
    });

});
