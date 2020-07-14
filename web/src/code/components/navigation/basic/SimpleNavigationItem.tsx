import React from 'react';
import clsx from 'clsx';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import { ConditionalTooltip } from '../../common/data-display/ConditionalTooltip';
import { useSideNavListItemStyles } from '../styles/useSideNavListItemStyles';
import { ListItemNavLink } from './ListItemNavLink';


export interface SimpleNavigationItemProps {
    to: string;
    label: string;
    ariaLabel?: string;
    Icon: React.ComponentType;
    isSideNavOpen: boolean;
}

export function SimpleNavigationItem({ to, label, ariaLabel = label, Icon, isSideNavOpen }: SimpleNavigationItemProps): React.ReactElement {
    const listItemStyles = useSideNavListItemStyles();

    return (
        <ConditionalTooltip condition={!isSideNavOpen} title={ariaLabel!}>
            <ListItemNavLink to={to} aria-label={ariaLabel}>

                <ListItemIcon>
                    <Icon />
                </ListItemIcon>

                <ListItemText
                    primary={label}
                    className={clsx(listItemStyles.listItemText, {
                        [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                    })}
                />

            </ListItemNavLink>
        </ConditionalTooltip>
    );
}
