import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';


export interface ListItemNavLinkProps extends Omit<NavLinkProps, 'activeClassName' | 'activeStyle'> {
    children: React.ReactNode;
}

export const ListItemNavLink = React.forwardRef(
    function ListItemNavLink({ children, to, ...rest }: ListItemNavLinkProps, ref): React.ReactElement {
        const classes = useStyles();

        const Link = React.useMemo(() => (
            React.forwardRef<any, Omit<NavLinkProps, 'to'>>((linkProps, ref) => (
                <NavLink ref={ref} to={to} {...linkProps} activeClassName={classes.activeRouterLink} />
            ))
        ), [ to, classes.activeRouterLink ]);

        return (
            <ListItem button component={Link} {...rest} ref={ref}>
                {children}
            </ListItem>
        );
    },
);

const useStyles = makeStyles((theme) => ({
    activeRouterLink: {
        backgroundColor: theme.palette.action.selected,
        // color: theme.palette.secondary.main
    },
}));
