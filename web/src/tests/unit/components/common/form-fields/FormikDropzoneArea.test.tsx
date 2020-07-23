import React from 'react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';

import { extendedUserEvent } from '../../../../__utils__/extendedUserEvent';

import { FormikDropzoneArea } from '../../../../../code/components/common/form-fields/FormikDropzoneArea';


describe('FormikDropzoneArea component', () => {

    function renderInFormikContext(onSubmit: jest.Mock): RenderResult {
        return render(
            <Formik
                initialValues={{ file: null }}
                validationSchema={Yup.object({
                    file: Yup.mixed().required('File not selected error'),
                })}
                onSubmit={onSubmit}
            >
                {() => (
                    <Form>
                        <FormikDropzoneArea
                            name='file'
                            label='Drag and drop some files here, or click to select files'
                            accept='image/*'
                        />
                        <button type='submit'>
                            {'Upload file'}
                        </button>
                    </Form>
                )}
            </Formik>,
        );
    }

    function createSampleFile(options: { filename: string; type: string; size?: number; }) {
        const file = new File([], options.filename, { type: options.type });
        return Object.defineProperty(file, 'size', { value: options.size || 1024 });
    }

    class ViewUnderTest {
        static get dropzone() {
            return screen.getByLabelText('Drag and drop some files here, or click to select files');
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 'Upload file' });
        }
    }

    it('should handle valid file successfully', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        // verify if initially no errors are visible
        expect(ViewUnderTest.dropzone).toHaveDescription('');

        // upload file and submit
        const file = createSampleFile({ filename: 'me.png', type: 'image/png' });
        await extendedUserEvent.drop(ViewUnderTest.dropzone, [ file ]);
        userEvent.click(ViewUnderTest.submitButton);

        // verify if submit was called with dropped file
        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({ file }, expect.any(Object));
    });

    it('should render accepted file name and delete button', async () => {
        renderInFormikContext(jest.fn());

        // upload file
        const file = createSampleFile({ filename: 'me.png', type: 'image/png' });
        await extendedUserEvent.drop(ViewUnderTest.dropzone, [ file ]);

        // verify if accepted file name is visible
        const fileChip = screen.getByRole('button', { name: 'me.png' });
        expect(fileChip).toBeVisible();

        // remove file
        await userEvent.type(fileChip, '{del}');
        await waitFor(() => expect(screen.queryByRole('button', { name: 'me.png' })).toBeNull());
    });

    it('should reject file with invalid type and display error', async () => {
        renderInFormikContext(jest.fn());

        // upload file
        const file = createSampleFile({ filename: 'hello.txt', type: 'text/plain' });
        await extendedUserEvent.drop(ViewUnderTest.dropzone, [ file ]);

        // verify if error is visible
        expect(ViewUnderTest.dropzone).toBeInvalid();
        expect(ViewUnderTest.dropzone).toHaveDescription('t:form.dropzone.validation.invalidType');
    });

    it('should reject too large file and display error', async () => {
        renderInFormikContext(jest.fn());

        // upload file
        const file = createSampleFile({ filename: 'me.png', type: 'image/png', size: 1e+8 + 1 });
        await extendedUserEvent.drop(ViewUnderTest.dropzone, [ file ]);

        // verify if error is visible
        expect(ViewUnderTest.dropzone).toBeInvalid();
        expect(ViewUnderTest.dropzone).toHaveDescription('t:form.dropzone.validation.tooLarge:{"filename":"me.png","maxSizeInMb":100}');
    });

    it('should reject multiple files and display error', async () => {
        renderInFormikContext(jest.fn());

        // upload file
        const files = [
            createSampleFile({ filename: 'me1.png', type: 'image/png' }),
            createSampleFile({ filename: 'me2.png', type: 'image/png' }),
        ];
        await extendedUserEvent.drop(ViewUnderTest.dropzone, files);

        // verify if error is visible
        expect(ViewUnderTest.dropzone).toBeInvalid();
        expect(ViewUnderTest.dropzone).toHaveDescription('t:form.dropzone.validation.toManyFiles');
    });

    it('should reject invalid file and display error', async () => {
        renderInFormikContext(jest.fn());

        // upload file
        const file = createSampleFile({ filename: 'invalid', type: 'image/png', size: -5 });
        await extendedUserEvent.drop(ViewUnderTest.dropzone, [ file ]);

        // verify if error is visible
        expect(ViewUnderTest.dropzone).toBeInvalid();
        expect(ViewUnderTest.dropzone).toHaveDescription('t:form.dropzone.validation.unknownError:{"filename":"invalid"}');
    });

    it('should display error on touch when no files are selected', async () => {
        renderInFormikContext(jest.fn());

        // focus dropzone
        userEvent.tab();
        expect(ViewUnderTest.dropzone).toHaveFocus();

        // focus submit button
        userEvent.tab();
        expect(ViewUnderTest.submitButton).toHaveFocus();

        // verify if error is visible
        await waitFor(() => expect(ViewUnderTest.dropzone).toBeInvalid());
        expect(ViewUnderTest.dropzone).toHaveDescription('File not selected error');
    });

});
