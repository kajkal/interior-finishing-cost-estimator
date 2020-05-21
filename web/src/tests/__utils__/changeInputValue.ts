import { fireEvent, waitFor } from '@testing-library/react';


export async function changeInputValue(element: HTMLInputElement, value: string): Promise<void> {
    fireEvent.change(element, { target: { value: value } });
    fireEvent.blur(element);
    await waitFor(() => expect(element.value).toBe(value));
}
