import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import PeopleIcon from '@material-ui/icons/People';

import { ConditionalTooltip } from '../common/data-display/ConditionalTooltip';
import { useSideNavController } from '../atoms/side-nav/useSideNavController';
import { ListItemNavLink } from './elements/ListItemNavLink';
import { ThemeTypeSwitch } from './elements/ThemeTypeSwitch';
import { LanguageMenu } from './elements/LanguageMenu';
import { routes } from '../../config/routes';


export function SideNav(): React.ReactElement {
    const classes = useStyles();
    const { isSideNavOpen } = useSideNavController();
    return (
        <>
            <Divider />
            <List>
                <LoginLink isSideNavOpen={isSideNavOpen} />
                <RegisterLink isSideNavOpen={isSideNavOpen} />
                <LogoutLink isSideNavOpen={isSideNavOpen} />
            </List>

            <Divider className={classes.divider} />
            <List>
                <ThemeTypeSwitch isSideNavOpen={isSideNavOpen} />
                <LanguageMenu isSideNavOpen={isSideNavOpen} />
            </List>
        </>
    );
}

export function LoginLink(props: any): React.ReactElement {
    return (
        <ConditionalTooltip condition={!props.isSideNavOpen} title='Log in'>
            <ListItemNavLink to={routes.login()} aria-label='Log in'>
                <ListItemIcon>
                    <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary={'Log in'} />
            </ListItemNavLink>
        </ConditionalTooltip>
    );
}

export function RegisterLink(props: any): React.ReactElement {
    return (
        <ConditionalTooltip condition={!props.isSideNavOpen} title='Sign up'>
            <ListItemNavLink to={routes.signup()} aria-label='Sign up'>
                <ListItemIcon>
                    <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary={'Sign up'} />
            </ListItemNavLink>
        </ConditionalTooltip>
    );
}

export function LogoutLink(props: any): React.ReactElement {
    return (
        <ConditionalTooltip condition={!props.isSideNavOpen} title='Logout'>
            <ListItemNavLink to={routes.logout()} aria-label='Logout' exact>
                <ListItemIcon>
                    <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary={'Logout'} />
            </ListItemNavLink>
        </ConditionalTooltip>
    );
}

const useStyles = makeStyles({
    divider: {
        marginTop: 'auto',
    },
});
