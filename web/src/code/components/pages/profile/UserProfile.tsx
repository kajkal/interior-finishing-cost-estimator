import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';

import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { UserProfileDataFragment } from '../../../../graphql/generated-types';
import { LocationChip } from '../../common/misc/LocationChip';


export interface UserProfileProps {
    profile: UserProfileDataFragment;
}

export function UserProfile({ profile }: UserProfileProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <div className={classes.profile}>

            <div className={classes.avatarContainer}>
                <Avatar
                    variant='rounded'
                    alt={profile.name}
                    src={profile.avatar || undefined}
                    className={classes.avatar}
                />
            </div>

            {!profile.description && (
                <Typography className={classes.description}>
                    {t('user.emptyProfileMessage', { name: profile.name })}
                </Typography>
            )}
            {profile.description && (
                <RichTextPreviewer
                    value={profile.description}
                    className={classes.description}
                />
            )}

            {profile.location && (
                <LocationChip
                    location={profile.location}
                    className={classes.location}
                />
            )}

        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    profile: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: `
            'location'
            'avatar'
            'description'
        `,
        gridGap: theme.spacing(2),
        gap: theme.spacing(2),

        [ theme.breakpoints.up('sm') ]: {
            gridTemplateColumns: '1fr 4fr',
            gridTemplateAreas: `
                'location location'
                'avatar description'
            `,
        },
    },
    location: {
        gridArea: 'location',
        justifySelf: 'flex-start',
    },
    avatarContainer: {
        gridArea: 'avatar',
        position: 'relative',
        paddingBottom: '100%',
        alignSelf: 'flex-start',
    },
    avatar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    description: {
        gridArea: 'description',
    },
}));
