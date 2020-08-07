import userEvent from '@testing-library/user-event';
import { fireEvent, getByText, getAllByRole, screen } from '@testing-library/react';

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

    addNewTag(tagName: string): TagsFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            await userEvent.paste(inputElement, tagName);
            return this.selectTagOption(tagName);
        }) as TagsFieldController;
    }

    addNewTags(tagNames: string[] | undefined | null): TagsFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            for (const tagName of tagNames || []) {
                await this.addNewTag(tagName);
            }
            return inputElement;
        }) as TagsFieldController;
    }

    selectTagOption(tagName: string): TagsFieldController {
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
        }) as TagsFieldController;
    }

    removeTag(tagName: string): TagsFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            const tagChip = TagsFieldController.getTagChip(inputElement, tagName);
            userEvent.click(tagChip.querySelector('svg')!);
            return inputElement;
        }) as TagsFieldController;
    }

    removeAllTags(): TagsFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            userEvent.click(screen.getByTitle('t:form.common.tags.clear'));
            return inputElement;
        }) as TagsFieldController;
    }

}
