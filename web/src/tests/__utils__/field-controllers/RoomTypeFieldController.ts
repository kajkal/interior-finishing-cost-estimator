import userEvent from '@testing-library/user-event';
import { fireEvent, getByRole, getByTitle } from '@testing-library/react';

import { mockTFunction } from '../../__mocks__/libraries/react-i18next';

import { roomTypeConfigMap, supportedRoomTypes } from '../../../code/config/supportedRoomTypes';
import { AbstractFieldController } from './AbstractFieldController';
import { RoomType } from '../../../graphql/generated-types';
import { flushPromises } from '../extendedUserEvent';


export class RoomTypeFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): RoomTypeFieldController {
        return this.resolve(inputElement) as RoomTypeFieldController;
    }

    clearCategory(): this {
        return this.then(async (inputElement: HTMLElement) => {
            userEvent.click(inputElement);
            userEvent.click(getByTitle(inputElement.parentElement!, 't:form.common.clear'));

            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as this;
    }

    selectRoomType(roomType: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            if (!supportedRoomTypes.includes(roomType as RoomType)) {
                throw new Error(`Invalid room type: '${roomType}' is not one of the supported types: [${supportedRoomTypes.join(', ')}]`);
            }

            const typeLabel = mockTFunction(roomTypeConfigMap[ roomType as RoomType ].tKey);
            userEvent.click(inputElement);

            await userEvent.type(inputElement, typeLabel);

            const optionsPopupId = inputElement.closest('[role="combobox"]')?.getAttribute('aria-owns');
            expect(optionsPopupId).toBeTruthy();

            const optionsPopup = document.getElementById(optionsPopupId!);
            expect(optionsPopup).toBeInTheDocument();

            const option = getByRole(optionsPopup!, 'option', { name: typeLabel, exact: false });
            userEvent.click(option);

            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as this;
    }

}
