import React from 'react';
import { ChipProps } from '@material-ui/core';

import LocationOnIcon from '@material-ui/icons/LocationOn';
import Chip from '@material-ui/core/Chip';

import { Location } from '../../../../graphql/generated-types';


export interface LocationChipProps extends Pick<ChipProps, 'size' | 'color' | 'className'> {
    location: Location;
    labelSuffix?: string;
}

export function LocationChip({ location, labelSuffix, ...rest }: LocationChipProps): React.ReactElement {
    const label = `${location.main}, ${location.secondary}` + (labelSuffix || '');
    return (
        <Chip
            icon={<LocationOnIcon />}
            label={label}

            component='a'
            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}&query_place_id=${location.placeId}`}
            rel='noreferrer'
            target='_blank'

            onClick={stopPropagationOnClick}

            clickable
            variant='outlined'

            {...rest}
        />
    );
}

function stopPropagationOnClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
}
