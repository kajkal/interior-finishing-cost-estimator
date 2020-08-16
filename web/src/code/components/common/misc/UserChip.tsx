import React from 'react';

import Chip, { ChipProps } from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

import { nav } from '../../../config/nav';


export interface UserChipProps extends Pick<ChipProps, 'size' | 'color' | 'className'> {
    user: {
        userSlug: string;
        name: string;
        avatar?: string | null;
    };
}

export function UserChip({ user, ...rest }: UserChipProps): React.ReactElement {
    return (
        <Chip
            avatar={<Avatar alt={user.name} src={user.avatar || undefined} />}
            label={user.name}

            component='a'
            href={nav.user(user.userSlug).profile()}
            rel='noreferrer'
            target='_blank'

            onClick={stopPropagationOnClick}

            clickable
            variant='outlined'

            {...rest}
        />
    );
}

function stopPropagationOnClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
}
