import React from 'react';

import { SvgIconProps } from '@material-ui/core/SvgIcon';

import { RoomType } from '../../graphql/generated-types';
import { BalconyIcon } from '../components/common/icons/room-type/BalconyIcon';
import { BathroomIcon } from '../components/common/icons/room-type/BathroomIcon';
import { BedroomIcon } from '../components/common/icons/room-type/BedroomIcon';
import { ClosetIcon } from '../components/common/icons/room-type/ClosetIcon';
import { GarageIcon } from '../components/common/icons/room-type/GarageIcon';
import { KidsRoomIcon } from '../components/common/icons/room-type/KidsRoomIcon';
import { KitchenIcon } from '../components/common/icons/room-type/KitchenIcon';
import { LaundryIcon } from '../components/common/icons/room-type/LaundryIcon';
import { LivingRoomIcon } from '../components/common/icons/room-type/LivingRoomIcon';
import { OfficeIcon } from '../components/common/icons/room-type/OfficeIcon';
import { OtherIcon } from '../components/common/icons/room-type/OtherIcon';


export interface RoomTypeConfig {
    tKey: string;
    Icon: React.ComponentType<SvgIconProps>;
}

export const roomTypeConfigMap: Record<keyof typeof RoomType, RoomTypeConfig> = {
    [ RoomType.BALCONY ]: {
        tKey: 'project.roomType.balcony',
        Icon: BalconyIcon,
    },
    [ RoomType.BATHROOM ]: {
        tKey: 'project.roomType.bathroom',
        Icon: BathroomIcon,
    },
    [ RoomType.BEDROOM ]: {
        tKey: 'project.roomType.bedroom',
        Icon: BedroomIcon,
    },
    [ RoomType.CLOSET ]: {
        tKey: 'project.roomType.closet',
        Icon: ClosetIcon,
    },
    [ RoomType.GARAGE ]: {
        tKey: 'project.roomType.garage',
        Icon: GarageIcon,
    },
    [ RoomType.KIDS_ROOM ]: {
        tKey: 'project.roomType.kidsRoom',
        Icon: KidsRoomIcon,
    },
    [ RoomType.KITCHEN ]: {
        tKey: 'project.roomType.kitchen',
        Icon: KitchenIcon,
    },
    [ RoomType.LAUNDRY ]: {
        tKey: 'project.roomType.laundry',
        Icon: LaundryIcon,
    },
    [ RoomType.LIVING_ROOM ]: {
        tKey: 'project.roomType.livingRoom',
        Icon: LivingRoomIcon,
    },
    [ RoomType.OFFICE ]: {
        tKey: 'project.roomType.office',
        Icon: OfficeIcon,
    },
    [ RoomType.OTHER ]: {
        tKey: 'project.roomType.other',
        Icon: OtherIcon,
    },
};

export const supportedRoomTypes = Object.keys(RoomType) as RoomType[];
