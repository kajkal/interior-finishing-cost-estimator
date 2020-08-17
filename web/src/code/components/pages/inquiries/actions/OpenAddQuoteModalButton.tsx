import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import Button, { ButtonProps } from '@material-ui/core/Button';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import { InquiryDataFragment } from '../../../../../graphql/generated-types';
import { inquiryAddQuoteModalAtom } from '../../../modals/inquiry-add-quote/inquiryAddQuoteModalAtom';


export interface OpenAddQuoteModalButtonProps extends ButtonProps {
    inquiry: InquiryDataFragment;
}

export function OpenAddQuoteModalButton({ inquiry, ...rest }: OpenAddQuoteModalButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const modalState = useSetRecoilState(inquiryAddQuoteModalAtom);

    const handleAddQuote = () => {
        modalState({
            open: true,
            inquiryData: inquiry,
        });
    };

    return (
        <Button variant='outlined' size='small' onClick={handleAddQuote} startIcon={<QuestionAnswerIcon />} {...rest}>
            {t('inquiry.addQuote')}
        </Button>
    );
}
