import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import Button, { ButtonProps } from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';

import { inquiryDeleteModalAtom } from '../../../modals/inquiry-delete/inquiryDeleteModalAtom';
import { InquiryDataFragment } from '../../../../../graphql/generated-types';


export interface OpenDeleteModalButtonProps extends ButtonProps {
    inquiry: InquiryDataFragment;
}

export function OpenDeleteModalButton({ inquiry, ...rest }: OpenDeleteModalButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const modalState = useSetRecoilState(inquiryDeleteModalAtom);

    const handleDelete = () => {
        modalState({
            open: true,
            inquiryData: {
                id: inquiry.id,
                title: inquiry.title,
            },
        });
    };

    return (
        <Button variant='outlined' size='small' onClick={handleDelete} startIcon={<DeleteIcon />} {...rest}>
            {t('form.common.delete')}
        </Button>
    );
}
