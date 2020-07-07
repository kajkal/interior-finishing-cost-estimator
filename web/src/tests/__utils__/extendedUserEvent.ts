import userEvent from '@testing-library/user-event';
import { fireEvent, waitFor } from '@testing-library/react';


async function type(element: HTMLElement, text: string) {
    userEvent.clear(element);
    await userEvent.type(element, text);
    fireEvent.blur(element);

    await waitFor(() => expect(element).toHaveValue(text));
}

export const extendedUserEvent = {
    type,
};
