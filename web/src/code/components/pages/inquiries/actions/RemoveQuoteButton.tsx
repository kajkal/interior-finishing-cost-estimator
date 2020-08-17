import React from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Tooltip from '@material-ui/core/Tooltip';

import { usePageLinearProgressRevealer } from '../../../common/progress-indicators/usePageLinearProgressRevealer';
import { ApolloErrorHandler } from '../../../../utils/error-handling/ApolloErrorHandler';
import { useRemoveQuoteMutation } from '../../../../../graphql/generated-types';


export interface RemoveQuoteButtonProps {
    inquiryId: string;
    quoteDate: string;
}

export function RemoveQuoteButton({ inquiryId, quoteDate }: RemoveQuoteButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const [ removeQuoteMutation, { loading } ] = useRemoveQuoteMutation();
    usePageLinearProgressRevealer(loading);

    const handleRemoveQuote = async () => {
        try {
            await removeQuoteMutation({
                variables: { inquiryId, quoteDate: quoteDate },
                update: (cache, { data }) => {
                    const updatedQuotes = data?.removeQuote;
                    updatedQuotes && cache.modify({
                        id: cache.identify({ __typename: 'Inquiry', id: inquiryId }),
                        fields: {
                            quotes: () => updatedQuotes,
                        },
                    });
                },
            });
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    };

    return (
        <Tooltip title={t('inquiry.removeQuote')!}>
            <IconButton size='small' onClick={handleRemoveQuote}>
                <ClearIcon />
            </IconButton>
        </Tooltip>
    );
}
