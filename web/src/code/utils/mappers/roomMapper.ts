import { TFunction } from 'i18next';

import { RoomUpdateFormData } from '../../components/modals/room-update/roomUpdateModalAtom';
import { categoryConfigMap } from '../../config/supportedCategories';
import { CompleteRoom } from './projectMapper';


export function mapCompleteRoomToRoomUpdateFormData(room: CompleteRoom, projectSlug: string, t: TFunction): RoomUpdateFormData {
    return {
        projectSlug,
        roomId: room.id,
        type: room.type,
        name: room.name,
        floor: room.floor || undefined,
        wall: room.wall || undefined,
        ceiling: room.ceiling || undefined,
        products: room.products || [],
        inquiries: room.inquiries.map((inquiry) => ({
            ...inquiry,
            translatedCategory: t(categoryConfigMap[ inquiry.category ].tKey),
        })),
    };
}
