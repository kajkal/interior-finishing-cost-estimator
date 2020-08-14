import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import SettingsIcon from '@material-ui/icons/Settings';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';

import { ConditionalTooltip } from '../../common/data-display/ConditionalTooltip';
import { useSideNavListItemStyles } from '../styles/useSideNavListItemStyles';
import { useCollapsibleList } from '../basic/useCollapsibleList';
import { ListItemNavLink } from '../basic/ListItemNavLink';
import { ExpandIcon } from '../../common/icons/ExpandIcon';
import { nav } from '../../../config/nav';


export interface AccountCollapsibleListProps {
    isSideNavOpen: boolean;
    onSideNavToggle: () => void;
    userName: string;
    avatarUrl: string | undefined | null;
}

export function AccountCollapsibleList({ isSideNavOpen, onSideNavToggle, userName, avatarUrl }: AccountCollapsibleListProps): React.ReactElement {
    const classes = useStyles();
    const listItemStyles = useSideNavListItemStyles();
    const { t } = useTranslation();
    const { expanded, onListTrigger } = useCollapsibleList(false, isSideNavOpen, onSideNavToggle);
    const accountOptions = React.useMemo(() => [
        { to: nav.profile(), Icon: AssignmentIndIcon, label: t('common.profile') },
        { to: nav.settings(), Icon: SettingsIcon, label: t('common.settings') },
        { to: nav.logout(), Icon: MeetingRoomIcon, label: t('common.logout') },
    ], [ t ]);

    return (
        <>
            <ConditionalTooltip condition={!isSideNavOpen} title={t('common.accountExpand')!}>
                <ListItem
                    button
                    onClick={onListTrigger}
                    aria-label={(expanded) ? t('common.accountCollapse') : t('common.accountExpand')}
                >

                    <ListItemAvatar>
                        <Avatar
                            variant='rounded'
                            alt={userName}
                            src={avatarUrl || undefined}
                            className={classes.avatar}
                        />
                    </ListItemAvatar>

                    <ListItemText
                        primary={userName}
                        className={clsx(listItemStyles.listItemText, {
                            [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                        })}
                    />

                    <ExpandIcon
                        expanded={expanded}
                        className={clsx(listItemStyles.listItem, {
                            [ listItemStyles.listItemShow ]: isSideNavOpen,
                        })}
                    />

                </ListItem>
            </ConditionalTooltip>

            <Collapse in={expanded} timeout='auto'>
                <List component='div' disablePadding dense>
                    {
                        accountOptions.map(({ to, Icon, label }) => (
                            <ListItemNavLink
                                key={to}
                                to={to}
                                className={listItemStyles.nested}
                                aria-label={label}
                                end
                            >
                                <ListItemIcon>
                                    <Icon/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={label}
                                    className={clsx(listItemStyles.listItemText, {
                                        [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                                    })}
                                />
                            </ListItemNavLink>
                        ))
                    }
                    <Divider />
                </List>
            </Collapse>
        </>
    );
}

const useStyles = makeStyles((theme) => ({
    avatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
}));
