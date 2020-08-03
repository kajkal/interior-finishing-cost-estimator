/**
 * @jest-environment jsdom-sixteen
 */

import React from 'react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { SlateDocument } from '@udecode/slate-plugins';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';

import { FormikRichTextEditor } from '../../../../../code/components/common/form-fields/ritch-text-editor/FormikRichTextEditor';
import { verifyIfDocumentIsNotEmpty } from '../../../../../code/utils/validation/richTestEditorSchema';
import { emptyEditorValue } from '../../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('FormikRichTextEditor component', () => {

    interface Options {
        node?: SlateDocument;
        autoFocus?: boolean;
        optional?: boolean;
        onSubmit?: jest.Mock;
    }

    function renderInFormikContext(config: Options = {}): RenderResult {
        return render(
            <Formik
                initialValues={{
                    content: config.node || emptyEditorValue,
                }}
                validationSchema={Yup.object({
                    content: Yup.array().min(1).test('match', 'Required error', verifyIfDocumentIsNotEmpty),
                })}
                onSubmit={config.onSubmit || jest.fn()}
            >
                {() => (
                    <Form>
                        <div data-testid='for-blur' />
                        <FormikRichTextEditor
                            name='content'
                            label='Enter content'
                            autoFocus={config.autoFocus}
                        />
                        <button type='submit' data-testid='submit-button' />
                    </Form>
                )}
            </Formik>,
        );
    }

    class ViewUnderTest {
        static get undoButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.undo' });
        }
        static get redoButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.redo' });
        }
        static get titleButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.title' });
        }
        static get subtitleButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.subtitle' });
        }
        static get boldButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.bold' });
        }
        static get italicButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.italic' });
        }
        static get underlineButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.underline' });
        }
        static get superscriptButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.superscript' });
        }
        static get bulletedListButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.bulletedList' });
        }
        static get numberedListButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.numberedList' });
        }
        static get todoListButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.todoList' });
        }
        static get insertLinkButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.insertLink' });
        }
        static get insertImageButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.insertImage' });
        }
        static get editor() {
            return screen.getByLabelText('t:form.editor.ariaLabel');
        }
        static get submitButton() {
            return screen.getByTestId('submit-button');
        }
    }

    it('should render rich text editor with toolbar', () => {
        renderInFormikContext();

        // verify toolbar
        expect(screen.getByRole('group', { name: 't:form.editor.toolbar.historyControls' })).toBeVisible();
        expect(ViewUnderTest.undoButton).toBeVisible();
        expect(ViewUnderTest.redoButton).toBeVisible();

        expect(screen.getByRole('group', { name: 't:form.editor.toolbar.headerControls' })).toBeVisible();
        expect(ViewUnderTest.titleButton).toBeVisible();
        expect(ViewUnderTest.subtitleButton).toBeVisible();

        expect(screen.getByRole('group', { name: 't:form.editor.toolbar.markControls' })).toBeVisible();
        expect(ViewUnderTest.boldButton).toBeVisible();
        expect(ViewUnderTest.italicButton).toBeVisible();
        expect(ViewUnderTest.underlineButton).toBeVisible();
        expect(ViewUnderTest.superscriptButton).toBeVisible();

        expect(screen.getByRole('group', { name: 't:form.editor.toolbar.listControls' })).toBeVisible();
        expect(ViewUnderTest.bulletedListButton).toBeVisible();
        expect(ViewUnderTest.numberedListButton).toBeVisible();
        expect(ViewUnderTest.todoListButton).toBeVisible();

        expect(screen.getByRole('group', { name: 't:form.editor.toolbar.attachmentControls' })).toBeVisible();
        expect(ViewUnderTest.insertLinkButton).toBeVisible();
        expect(ViewUnderTest.insertImageButton).toBeVisible();

        // verify editor area
        expect(ViewUnderTest.editor).toBeVisible();
    });

    it('should submit form with editor value', async () => {
        const mockHandleSubmit = jest.fn();
        renderInFormikContext({
            onSubmit: mockHandleSubmit,
            node: [ {
                children: [
                    { type: 'p', children: [ { text: 'Sample value' } ] },
                ],
            } ],
        });

        userEvent.click(ViewUnderTest.submitButton);

        // verify if onSubmit was called
        await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalledTimes(1));
        expect(mockHandleSubmit).toHaveBeenCalledWith({
            content: [ {
                children: [
                    { type: 'p', children: [ { text: 'Sample value' } ] },
                ],
            } ],
        }, expect.any(Object));
    });

    it('should display error on submit when editor is empty', async () => {
        const mockHandleSubmit = jest.fn();
        renderInFormikContext({
            onSubmit: mockHandleSubmit,
            node: [ {
                children: [
                    { type: 'p', children: [ { text: '' } ] },
                ],
            } ],
        });

        userEvent.click(ViewUnderTest.submitButton);

        // verify if error is visible
        await waitFor(() => expect(ViewUnderTest.editor).toBeInvalid());
        expect(ViewUnderTest.editor).toHaveDescription('Required error');
        expect(mockHandleSubmit).toHaveBeenCalledTimes(0);
    });

    it('should focus editor on render when {autoFocus} prop is set to true', () => {
        const { unmount } = renderInFormikContext({ autoFocus: false });

        // verify body is focused
        expect(document.body).toHaveFocus();

        unmount();
        renderInFormikContext({ autoFocus: true });

        // verify if editor is focused
        expect(ViewUnderTest.editor).toHaveFocus();
    });

    it('should render title node', () => {
        renderInFormikContext({
            node: [ {
                children: [
                    { type: 'h1', children: [ { text: 'Title node' } ] },
                ],
            } ],
        });
        expect(screen.getByText('Title node')).toBeVisible();
    });

    it('should render subtitle node', () => {
        renderInFormikContext({
            node: [ {
                children: [
                    { type: 'h2', children: [ { text: 'Subtitle node' } ] },
                ],
            } ],
        });
        expect(screen.getByText('Subtitle node')).toBeVisible();
    });

    it('should render paragraph node', () => {
        renderInFormikContext({
            node: [ {
                children: [
                    { type: 'p', children: [ { text: 'Paragraph node' } ] },
                ],
            } ],
        });
        expect(screen.getByText('Paragraph node')).toBeVisible();
    });

    it('should render link node', () => {
        renderInFormikContext({
            node: [ {
                children: [
                    {
                        type: 'p',
                        children: [
                            { text: '' },
                            {
                                type: 'a',
                                url: 'http://example.com',
                                children: [
                                    {
                                        text: 'Link node',
                                    },
                                ],
                            },
                            { text: '' },
                        ],
                    },
                ],
            } ],
        });
        expect(screen.getByText('Link node')).toBeVisible();
        expect(screen.getByText('Link node').closest('a')).toHaveAttribute('href', 'http://example.com');
    });

    it('should render todo list item node', () => {
        renderInFormikContext({
            node: [ {
                children: [
                    { type: 'action_item', children: [ { text: 'TODO list item' } ] },
                ],
            } ],
        });
        expect(screen.getByText('TODO list item')).toBeVisible();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        userEvent.click(screen.getByRole('checkbox'));
    });

});
