import userEvent from '@testing-library/user-event';
import { act, fireEvent, waitFor } from '@testing-library/react';


async function type(element: HTMLElement, text: string) {
    userEvent.clear(element);
    await userEvent.type(element, text);
    fireEvent.blur(element);

    await waitFor(() => expect(element).toHaveValue(text));
}


async function drop(element: HTMLElement, files: File[]) {
    const event = new Event('drop', { bubbles: true });
    Object.assign(event, {
        dataTransfer: {
            files,
            items: files.map(file => ({
                kind: 'file',
                size: file.size,
                type: file.type,
                getAsFile: () => file,
            })),
            types: [ 'Files' ],
        },
    });
    fireEvent(element, event);
    await act(async () => { // flush promises:
        await new Promise((resolve) => setImmediate(resolve));
    });
}


export const extendedUserEvent = {
    type,
    drop,
};
