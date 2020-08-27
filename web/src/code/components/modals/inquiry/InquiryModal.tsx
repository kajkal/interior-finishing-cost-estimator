import React from 'react';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CategoryIcon from '@material-ui/icons/Category';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';

import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { categoryConfigMap } from '../../../config/supportedCategories';
import { ResponsiveModalProps } from '../ResponsiveModalProps';
import { LocationChip } from '../../common/misc/LocationChip';
import { QuoteList } from '../../pages/inquiries/QuoteList';
import { inquiryModalAtom } from './inquiryModalAtom';


export function InquiryModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { open, inquiryData }, setModalState ] = useRecoilState(inquiryModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'inquiry-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {inquiryData?.title || ''}
            </DialogTitle>

            {(inquiryData) && (
                <DialogContent>

                    <div>
                        <Chip
                            label={t(categoryConfigMap[ inquiryData.category ].tKey)}
                            icon={<CategoryIcon />}
                            size='small'
                            variant='outlined'
                            className={classes.tagChip}
                        />
                        <LocationChip
                            location={inquiryData.location}
                            className={classes.tagChip}
                            size='small'
                        />
                    </div>

                    <RichTextPreviewer value={inquiryData.description} className={classes.description} />

                    <Divider className={classes.divider} />
                    <Typography variant='body2' gutterBottom color='textSecondary'>
                        {t('inquiry.quotesSectionTitle')}
                    </Typography>
                    <QuoteList
                        quotes={inquiryData.quotes}
                        inquiryId={inquiryData.id}
                        userSlug={''}
                    />

                </DialogContent>
            )}

            <DialogActions>
                <Button type='button' variant='outlined' onClick={handleModalClose}>
                    {t('form.common.close')}
                </Button>
            </DialogActions>

        </Dialog>
    );
}


const useStyles = makeStyles((theme) => ({
    description: {
        marginTop: theme.spacing(4),
    },
    divider: {
        margin: theme.spacing(2, 0, 1),
    },
    tagChip: {
        marginTop: 3,
        marginRight: 3,
    },
}));
