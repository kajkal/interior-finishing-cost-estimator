import React from 'react';

import { SvgIconProps } from '@material-ui/core/SvgIcon';

import { roomTypeConfigMap } from '../../../config/supportedRoomTypes';
import { RoomType } from '../../../../graphql/generated-types';


export interface ConsciousRoomTypeIconProps extends SvgIconProps {
    roomType: RoomType;
}

export function ConsciousRoomTypeIcon({ roomType, ...rest }: ConsciousRoomTypeIconProps): React.ReactElement {
    const { Icon } = roomTypeConfigMap[ roomType ];
    return <Icon {...rest} />;
}
