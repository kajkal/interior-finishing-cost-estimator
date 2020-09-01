import userEvent from '@testing-library/user-event';
import { fireEvent, getAllByRole, getByText, screen } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { flushPromises } from '../extendedUserEvent';


export class TagsFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): TagsFieldController {
        return this.resolve(inputElement) as TagsFieldController;
    }

    private static getTagChip(inputElement: HTMLElement, tagName: string) {
        const tagChip = getByText(inputElement.parentElement!, tagName).parentElement!;
        expect(tagChip).toHaveAttribute('role', 'button');
        return tagChip;
    }

    addNewTag(tagName: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            await userEvent.paste(inputElement, tagName);
            return this.selectTagOption(tagName);
        }) as this;
    }

    addNewTags(tagNames: string[] | undefined | null): this {
        return this.then(async (inputElement: HTMLElement) => {
            for (const tagName of tagNames || []) {
                await this.addNewTag(tagName);
            }
            return inputElement;
        }) as this;
    }

    selectTagOption(tagName: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            await userEvent.type(inputElement, '');
            const optionList = screen.getByRole('listbox');
            const options = getAllByRole(optionList, 'option');
            const option = options.find((o) => o.textContent?.match(tagName));
            expect(option).toBeDefined();
            userEvent.click(option!);
            expect(TagsFieldController.getTagChip(inputElement, tagName)).toBeVisible();
            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as this;
    }

    removeTag(tagName: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            const tagChip = TagsFieldController.getTagChip(inputElement, tagName);
            userEvent.click(tagChip.querySelector('svg')!);
            return inputElement;
        }) as this;
    }

    removeAllTags(): TagsFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            userEvent.click(screen.getByTitle('t:form.common.clear'));
            return inputElement;
        }) as TagsFieldController;
    }

}
