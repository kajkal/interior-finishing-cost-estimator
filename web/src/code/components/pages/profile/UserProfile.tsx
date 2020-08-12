import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { Location, UserProfileDataFragment } from '../../../../graphql/generated-types';


export interface UserProfileProps {
    profile: UserProfileDataFragment;
}

export function UserProfile({ profile }: UserProfileProps): React.ReactElement {
    const classes = useStyles();

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


export interface LocationChipProps {
    location: Location;
    className: string;
}

export function LocationChip({ location, className }: LocationChipProps): React.ReactElement {
    const label = `${location.main}, ${location.secondary}`;
    return (
        <Chip
            icon={<LocationOnIcon />}
            label={label}
            component='a'
            className={className}
            href={`https://www.google.com/maps/place/?q=place_id:${location.placeId}`}
            clickable
            variant='outlined'
        />
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
