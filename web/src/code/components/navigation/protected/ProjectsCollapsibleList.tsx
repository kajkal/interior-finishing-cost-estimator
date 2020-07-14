import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

import { ConditionalTooltip } from '../../common/data-display/ConditionalTooltip';
import { useSideNavListItemStyles } from '../styles/useSideNavListItemStyles';
import { useCollapsibleList } from '../basic/useCollapsibleList';
import { UserData } from '../../../utils/hooks/useUserData';
import { ListItemNavLink } from '../basic/ListItemNavLink';
import { nav } from '../../../config/nav';


export interface ProjectsCollapsibleListProps {
    isSideNavOpen: boolean;
    onSideNavToggle: () => void;
    userData: UserData;
}

export function ProjectsCollapsibleList({ isSideNavOpen, onSideNavToggle, userData }: ProjectsCollapsibleListProps): React.ReactElement {
    const listItemStyles = useSideNavListItemStyles();
    const { t } = useTranslation();
    const { open, onClick, ExpandIcon } = useCollapsibleList(true, isSideNavOpen, onSideNavToggle);

    return (
        <>
            <ConditionalTooltip condition={!isSideNavOpen} title={t('common.projectsExpand')!}>
                <ListItem
                    button
                    onClick={onClick}
                    aria-label={(open) ? t('common.projectsCollapse') : t('common.projectsExpand')}
                >

                    <ListItemIcon>
                        <InsertDriveFileIcon />
                    </ListItemIcon>

                    <ListItemText
                        primary={t('common.projects')}
                        className={clsx(listItemStyles.listItemText, {
                            [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                        })}
                    />

                    <ExpandIcon
                        className={clsx(listItemStyles.listItem, {
                            [ listItemStyles.listItemShow ]: isSideNavOpen,
                        })}
                    />

                </ListItem>
            </ConditionalTooltip>

            <Collapse in={open} timeout='auto'>
                <List component='div' disablePadding dense>
                    {
                        userData.projects.map(({ id, slug, name }) => (
                            <ListItemNavLink
                                key={id}
                                to={nav.user(userData.slug).projects(slug)}
                                className={listItemStyles.nested}
                                aria-label={t('common.projectAriaLabel', { name })}
                            >
                                <ListItemText
                                    primary={name}
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
