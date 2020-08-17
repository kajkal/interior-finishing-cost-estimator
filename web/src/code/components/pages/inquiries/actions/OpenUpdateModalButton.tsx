import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import Button, { ButtonProps } from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';

import { inquiryUpdateModalAtom } from '../../../modals/inquiry-update/inquiryUpdateModalAtom';
import { mapInquiryToInquiryUpdateFormData } from '../../../../utils/mappers/inquiryMapper';
import { InquiryDataFragment } from '../../../../../graphql/generated-types';


export interface OpenUpdateModalButtonProps extends ButtonProps {
    inquiry: InquiryDataFragment;
}

export function OpenUpdateModalButton({ inquiry, ...rest }: OpenUpdateModalButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const modalState = useSetRecoilState(inquiryUpdateModalAtom);

    const handleUpdate = () => {
        modalState({
            open: true,
            inquiryData: mapInquiryToInquiryUpdateFormData(inquiry, t),
        });
    };

    return (
        <Button variant='outlined' size='small' onClick={handleUpdate} startIcon={<EditIcon />} {...rest}>
            {t('form.common.update')}
        </Button>
    );
}
