/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: document.createRange is not a function]'
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import { LocationFieldController } from '../../../../__utils__/field-controllers/LocationFieldController';
import { generator } from '../../../../__utils__/generator';

import { InquiryFilterLocation } from '../../../../../code/components/pages/inquiries/filters/InquiryFilterLocation';


describe('InquiryFilterLocation component', () => {

    const sampleLocation = generator.location({ lat: undefined, lng: undefined });
    const sampleLatLng = { lat: 50, lng: 20 };

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

        await LocationFieldController.from(ViewUnderTest.locationSelect).selectLocation(sampleLocation, sampleLatLng);

        expect(mockAtomUpdater).toHaveBeenCalledTimes(1);
        const updateFn = mockAtomUpdater.mock.calls[ 0 ][ 0 ];
        expect(updateFn({})).toEqual({
            location: {
                place_id: sampleLocation.placeId,
                description: `${sampleLocation.main}, ${sampleLocation.secondary}`,
                latLng: {
                    lat: sampleLatLng.lat,
                    lng: sampleLatLng.lng,
                },
                structured_formatting: {
                    main_text: sampleLocation.main,
                    secondary_text: sampleLocation.secondary,
                    main_text_matched_substrings: [],
                },
            },
        });
    });

});
