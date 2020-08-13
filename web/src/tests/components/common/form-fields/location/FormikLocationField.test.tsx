/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: document.createRange is not a function]'
 */

import React from 'react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';

import { extendedUserEvent } from '../../../../__utils__/extendedUserEvent';

import * as useLazyAutocompleteServiceModule from '../../../../../code/components/common/form-fields/location/useLazyAutocompleteService';
import { FormikLocationField } from '../../../../../code/components/common/form-fields/location/FormikLocationField';
import { LocationOption } from '../../../../../code/components/common/form-fields/location/LocationField';


describe('FormikLocationField component', () => {

    let useLazyAutocompleteServiceSpy: jest.SpiedFunction<typeof useLazyAutocompleteServiceModule.useLazyAutocompleteService>;

    beforeEach(() => {
        useLazyAutocompleteServiceSpy?.mockRestore();
        useLazyAutocompleteServiceSpy = jest.spyOn(useLazyAutocompleteServiceModule, 'useLazyAutocompleteService');
        useLazyAutocompleteServiceSpy.mockReturnValue({ getPlacePredictions: undefined });
    });

    const inputValue = 'krakow';
    const locationOptions = [
        {
            description: 'Kraków, Poland',
            place_id: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
            structured_formatting: {
                main_text: 'Kraków',
                main_text_matched_substrings: [ { length: 6, offset: 0 } ],
                secondary_text: 'Poland',
            },
        },
        {
            description: 'Kraków Główny, Pawia, Kraków, Poland',
            place_id: 'ChIJX4B9qBtbFkcR4hg5zRO0-V4',
            structured_formatting: {
                main_text: 'Kraków Główny',
                main_text_matched_substrings: [ { length: 6, offset: 0 } ],
                secondary_text: 'Pawia, Kraków, Poland',
            },
        },
        {
            description: 'Krakow am See, Germany',
            place_id: 'ChIJKRan_XQXrEcRRvU5g9-65QU',
            structured_formatting: {
                main_text: 'Krakow am See',
                main_text_matched_substrings: [ { length: 6, offset: 0 } ],
                secondary_text: 'Germany',
            },
        },
        {
            description: 'Krakowskie Przedmieście, Warsaw, Poland',
            place_id: 'EihLcmFrb3dza2llIFByemVkbWllxZtjaWUsIFdhcnNhdywgUG9sYW5kIi4qLAoUChIJB7hLtGDMHkcRRtv8aFdVQXESFAoSCQGfhppmzB5HEfzT6ogqvvBy',
            structured_formatting: {
                main_text: 'Krakowskie Przedmieście',
                main_text_matched_substrings: [ { length: 6, offset: 0 } ],
                secondary_text: 'Warsaw, Poland',
            },
        },
        {
            description: 'Krakowska, Wrocław, Poland',
            place_id: 'EhtLcmFrb3dza2EsIFdyb2PFgmF3LCBQb2xhbmQiLiosChQKEgnHRTSUk8IPRxF7XrVJI1p_phIUChIJv4q11MLpD0cR9eAFwq5WCbc',
            structured_formatting: {
                main_text: 'Krakowska',
                main_text_matched_substrings: [ { length: 6, offset: 0 } ],
                secondary_text: 'Wrocław, Poland',
            },
        },
    ];

    function renderInFormikContext(mockHandleSubmit = jest.fn()): RenderResult {
        return render(
            <Formik
                initialValues={{
                    location: null,
                }}
                validationSchema={Yup.object({
                    location: Yup.mixed<LocationOption>().required('missing location'),
                })}
                onSubmit={mockHandleSubmit}
            >
                <Form>
                    <FormikLocationField name='location' label='Location' />
                    <button type='submit' data-testid='submit-button' />
                </Form>
            </Formik>,
        );
    }

    class ViewUnderTest {
        static get locationAutocomplete() {
            return screen.getByLabelText('Location', { selector: 'input' }) as HTMLInputElement;
        }
        static get locationOptions() {
            return screen.findAllByRole('option');
        }
        static get submitButton() {
            return screen.getByTestId('submit-button');
        }
    }

    it('should call google maps api for location options based on user input', async () => {
        const mockCancelRequest = jest.fn();
        const mockGetPlacePredictions = jest.fn().mockImplementation(({ input }, callback) => {
            callback((input === inputValue) ? locationOptions : []);
        });
        Object.defineProperty(mockGetPlacePredictions, 'cancel', { value: mockCancelRequest });
        useLazyAutocompleteServiceSpy.mockReturnValue({ getPlacePredictions: mockGetPlacePredictions } as any);

        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        userEvent.click(ViewUnderTest.locationAutocomplete);

        // verify if 'No option' option is visible
        expect(screen.getByText('t:form.common.noOption')).toBeVisible();

        await userEvent.type(ViewUnderTest.locationAutocomplete, inputValue);

        // verify if 5 mocked options are visible
        const options = await ViewUnderTest.locationOptions;
        expect(options).toHaveLength(5);
        expect(options.map(o => o.textContent)).toEqual([
            'KrakówPoland',
            'Kraków GłównyPawia, Kraków, Poland',
            'Krakow am SeeGermany',
            'Krakowskie PrzedmieścieWarsaw, Poland',
            'KrakowskaWrocław, Poland',
        ]);

        // select first option
        userEvent.click(options[ 0 ]);

        // verify if option was selected
        expect(ViewUnderTest.locationAutocomplete).toHaveValue('Kraków, Poland');

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({
            location: locationOptions[ 0 ],
        }, expect.any(Object));
    });

    it('should display error in case of failed location validation', async () => {
        renderInFormikContext();

        await extendedUserEvent.type(ViewUnderTest.locationAutocomplete, '');

        await waitFor(() => expect(ViewUnderTest.locationAutocomplete).toBeInvalid());
        expect(ViewUnderTest.locationAutocomplete).toHaveDescription('missing location');
    });

});
