import React from 'react';
import { useTranslation } from 'react-i18next';

import Button, { ButtonProps } from '@material-ui/core/Button';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';

import { usePageLinearProgressRevealer } from '../../../common/progress-indicators/usePageLinearProgressRevealer';
import { ApolloErrorHandler } from '../../../../utils/error-handling/ApolloErrorHandler';
import { useBookmarkInquiryMutation } from '../../../../../graphql/generated-types';


export interface ToggleBookmarkButtonProps extends ButtonProps {
    inquiryId: string;
    isBookmarked: boolean;
    userSlug: string;
}

export function ToggleBookmarkButton({ inquiryId, isBookmarked, userSlug, ...rest }: ToggleBookmarkButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const [ bookmarkInquiryMutation, { loading } ] = useBookmarkInquiryMutation();
    usePageLinearProgressRevealer(loading);

    const handleToggleBookmark = async () => {
        try {
            await bookmarkInquiryMutation({
                variables: { inquiryId, bookmark: !isBookmarked },
                update: (cache, { data }) => {
                    const newBookmarkedInquiries = data?.bookmarkInquiry;
                    if (newBookmarkedInquiries) {
                        cache.modify({
                            id: cache.identify({ __typename: 'User', slug: userSlug }),
                            fields: {
                                bookmarkedInquiries: () => newBookmarkedInquiries,
                            },
                        });
                    }
                },
            });
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    };

    return (
        <Button
            variant='outlined'
            size='small'
            onClick={handleToggleBookmark}
            startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            {...rest}
        >
            {isBookmarked ? t('inquiry.removeBookmark') : t('inquiry.addBookmark')}
        </Button>
    );
}
