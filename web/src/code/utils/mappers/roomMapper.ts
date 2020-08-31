import { TFunction } from 'i18next';

import { RoomUpdateFormData } from '../../components/modals/room-update/roomUpdateModalAtom';
import { categoryConfigMap } from '../../config/supportedCategories';
import { CurrencyAmount } from '../../../graphql/generated-types';
import { findLowestQuote } from './inquiryMapper';
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

export interface Summary {
    product: CurrencyAmount[];
    inquiry: CurrencyAmount[];
}

export function summarizeRoom(room: CompleteRoom): Summary {
    const productSummary = room.products.reduce((currencyTotalAmountMap, { product: { price }, amount }) => {
        if (price) {
            const accumulatedAmount = currencyTotalAmountMap[ price.currency ] || 0;
            currencyTotalAmountMap[ price.currency ] = accumulatedAmount + (amount * price.amount);
        }
        return currencyTotalAmountMap;
    }, {} as Record<string, number>);

    const inquirySummary = room.inquiries.reduce((currencyTotalAmountMap, inquiry) => {
        const minQuote = findLowestQuote(inquiry);
        if (minQuote) {
            const accumulatedAmount = currencyTotalAmountMap[ minQuote.price.currency ] || 0;
            currencyTotalAmountMap[ minQuote.price.currency ] = accumulatedAmount + minQuote.price.amount;
        }
        return currencyTotalAmountMap;
    }, {} as Record<string, number>);

    return {
        product: sortSummaryRecord(productSummary),
        inquiry: sortSummaryRecord(inquirySummary),
    };
}

export function summarizeRooms(roomSummaries: Summary[]): Summary {
    const productSummary: Record<string, number> = {};
    const inquirySummary: Record<string, number> = {};

    roomSummaries.forEach(({ product, inquiry }) => {
        product.forEach(({ currency, amount }) => {
            const accumulatedAmount = productSummary[ currency ] || 0;
            productSummary[ currency ] = accumulatedAmount + amount;
        });
        inquiry.forEach(({ currency, amount }) => {
            const accumulatedAmount = inquirySummary[ currency ] || 0;
            inquirySummary[ currency ] = accumulatedAmount + amount;
        });
    });

    return {
        product: sortSummaryRecord(productSummary),
        inquiry: sortSummaryRecord(inquirySummary),
    };
}

export function summarizeAll(roomsSummary: Summary): CurrencyAmount[] {
    const totalSummary: Record<string, number> = {};

    roomsSummary.product.forEach(({ currency, amount }) => {
        const accumulatedAmount = totalSummary[ currency ] || 0;
        totalSummary[ currency ] = accumulatedAmount + amount;
    });
    roomsSummary.inquiry.forEach(({ currency, amount }) => {
        const accumulatedAmount = totalSummary[ currency ] || 0;
        totalSummary[ currency ] = accumulatedAmount + amount;
    });

    return sortSummaryRecord(totalSummary);
}

function sortSummaryRecord(summaryRecord: Record<string, number>): CurrencyAmount[] {
    return Object.entries(summaryRecord)
        .map(([ currency, amount ]) => ({ currency, amount }))
        .sort(({ currency: a }, { currency: b }) => a.localeCompare(b));
}
