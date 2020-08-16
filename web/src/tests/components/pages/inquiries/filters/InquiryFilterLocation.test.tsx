/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: document.createRange is not a function]'
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import { LocationFieldController } from '../../../../__utils__/field-controllers/LocationFieldController';

import { InquiryFilterLocation } from '../../../../../code/components/pages/inquiries/filters/InquiryFilterLocation';


describe('InquiryFilterLocation component', () => {

    const sampleLocation = {
            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
            main: 'Kraków',
            secondary: 'Poland',
            lat: 50,
            lng: 20,
    };

    class ViewUnderTest {
        static get locationSelect() {
            return screen.getByPlaceholderText('t:inquiry.filters.locationPlaceholder');
        }
    }

    it('should update filter atom state on change', async () => {
        const mockAtomUpdater = jest.fn();
        render(<InquiryFilterLocation location={null} setFilters={mockAtomUpdater} className='' />);

        expect(ViewUnderTest.locationSelect).toBeVisible();
        expect(ViewUnderTest.locationSelect).toHaveValue('');

        await LocationFieldController.from(ViewUnderTest.locationSelect).selectLocation(sampleLocation);

        expect(mockAtomUpdater).toHaveBeenCalledTimes(1);
        const updateFn = mockAtomUpdater.mock.calls[ 0 ][ 0 ];
        expect(updateFn({})).toEqual({
            location: {
                place_id: "ChIJ0RhONcBEFkcRv4pHdrW2a7Q",
                description: "Kraków, Poland",
                structured_formatting: {
                    main_text: "Kraków",
                    main_text_matched_substrings: [],
                    secondary_text: "Poland"
                },
                latLng: {
                    lat: 50,
                    lng: 20
                },
            }
        });
    });

});
