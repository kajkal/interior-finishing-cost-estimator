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
import AddIcon from '@material-ui/icons/Add';

import { ConditionalTooltip } from '../../common/data-display/ConditionalTooltip';
import { useSideNavListItemStyles } from '../styles/useSideNavListItemStyles';
import { useCollapsibleList } from '../basic/useCollapsibleList';
import { Project } from '../../../../graphql/generated-types';
import { ListItemNavLink } from '../basic/ListItemNavLink';
import { ExpandIcon } from '../../common/icons/ExpandIcon';
import { nav } from '../../../config/nav';


export interface ProjectsCollapsibleListProps {
    isSideNavOpen: boolean;
    onSideNavToggle: () => void;
    projects: Pick<Project, 'slug' | 'name'>[];
}

export function ProjectsCollapsibleList({ isSideNavOpen, onSideNavToggle, projects }: ProjectsCollapsibleListProps): React.ReactElement {
    const listItemStyles = useSideNavListItemStyles();
    const { t } = useTranslation();
    const { expanded, onListTrigger } = useCollapsibleList(true, isSideNavOpen, onSideNavToggle);

    return (
        <>
            <ConditionalTooltip condition={!isSideNavOpen} title={t('common.projectsExpand')!}>
                <ListItem
                    button
                    onClick={onListTrigger}
                    aria-label={(expanded) ? t('common.projectsCollapse') : t('common.projectsExpand')}
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
                        expanded={expanded}
                        className={clsx(listItemStyles.listItem, {
                            [ listItemStyles.listItemShow ]: isSideNavOpen,
                        })}
                    />

                </ListItem>
            </ConditionalTooltip>

            <Collapse in={expanded} timeout='auto'>
                <List component='div' disablePadding dense>
                    <ListItemNavLink
                        to={nav.createProject()}
                        className={listItemStyles.nested}
                        aria-label={t('common.createProject')}
                        end
                    >

                        <ListItemIcon>
                            <AddIcon fontSize='small' />
                        </ListItemIcon>

                        <ListItemText
                            primary={t('common.createProject')}
                            className={clsx(listItemStyles.listItemText, {
                                [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                            })}
                            classes={{
                                primary: listItemStyles.listItemTextInner,
                            }}
                        />

                    </ListItemNavLink>
                    {
                        projects.map(({ slug, name }) => (
                            <ListItemNavLink
                                key={slug}
                                to={nav.project(slug)}
                                className={listItemStyles.nested}
                                aria-label={t('common.projectAriaLabel', { name })}
                                end
                            >
                                <ListItemText
                                    primary={name}
                                    className={clsx(listItemStyles.listItemText, {
                                        [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                                    })}
                                    classes={{
                                        primary: listItemStyles.listItemTextInner,
                                    }}
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
