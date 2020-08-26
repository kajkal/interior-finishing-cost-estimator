import userEvent from '@testing-library/user-event';
import { getByRole, screen } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { Inquiry } from '../../../graphql/generated-types';
import { flushPromises } from '../extendedUserEvent';


export class InquirySelectorController extends AbstractFieldController {

    static from(inputElement: HTMLElement): InquirySelectorController {
        return this.resolve(inputElement) as InquirySelectorController;
    }

    selectInquiry(inquiry: Partial<Inquiry>): this {
        return this.then(async (inputElement: HTMLElement) => {
            await userEvent.type(inputElement, inquiry.title || '');
            const option = screen.getByTestId(`option-${inquiry.id}`);
            userEvent.click(option);

            const inquiryRow = screen.getByTestId(`inquiry-${inquiry.id}`);
            expect(inquiryRow).toBeInTheDocument();

            await flushPromises();
            return inputElement;
        }) as this;
    }

    removeAllInquiries(): this {
        return this.then(async (inputElement: HTMLElement) => {
            const inquiryRows = screen.getAllByTestId(/inquiry-/);
            inquiryRows.forEach((inquiryRow) => {
                userEvent.click(getByRole(inquiryRow, 'button', { name: 't:form.roomInquirySelector.deleteButton.title' }));
            });
            await flushPromises();
            return inputElement;
        }) as this;
    }

}
