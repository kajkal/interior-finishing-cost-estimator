import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import LockIcon from '@material-ui/icons/Lock';
import List from '@material-ui/core/List';

import { useSessionState } from '../providers/apollo/cache/session/useSessionState';
import { ConditionalTooltip } from '../common/data-display/ConditionalTooltip';
import { useSideNavController } from '../atoms/side-nav/useSideNavController';
import { ListItemNavLink } from './elements/ListItemNavLink';
import { ThemeTypeSwitch } from './elements/ThemeTypeSwitch';
import { LanguageMenu } from './elements/LanguageMenu';
import { routes } from '../../config/routes';


const guestLinks = [
    { to: routes.login(), name: 'Log in' },
    { to: routes.signup(), name: 'Sign up' },
    { to: routes.forgotPassword(), name: 'Forgot password' },
    { to: '/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWRkNzBhYTkwZTAyMjQwYzQ4MWVhYmMiLCJpYXQiOjE1OTE5OTQ1ODUsImV4cCI6MTU5MjAwMTc4NX0.a_z0oLDGseLxX5KD4tLliYsix05_dMfp1CUwCG5E1VQ', name: 'Password reset' },
];

const userLinks = [
    { to: routes.projects(), name: 'Projects' },
    { to: '/protected', name: 'Protected' },
    { to: routes.logout(), name: 'Logout' },
];

export function SideNav(): React.ReactElement {
    const classes = useStyles();
    const { isSideNavOpen } = useSideNavController();
    const { isUserLoggedIn } = useSessionState();

    return (
        <>
            <Divider />
            <List>
                <ListItem>
                    <ListItemIcon>
                        {
                            (isUserLoggedIn)
                                ? <LockOpenIcon style={{ color: 'green' }} />
                                : <LockIcon style={{ color: 'red' }} />
                        }
                    </ListItemIcon>
                    <ListItemText primary={(isUserLoggedIn) ? 'YES' : 'NO'} />
                </ListItem>
                {
                    (isUserLoggedIn ? userLinks : guestLinks).map((link, index) => (
                        <ConditionalTooltip key={index} condition={!isSideNavOpen} title={link.name}>
                            <ListItemNavLink to={link.to} aria-label={link.name}>
                                <ListItemIcon>
                                    <ArrowForwardIosIcon />
                                </ListItemIcon>
                                <ListItemText primary={link.name} />
                            </ListItemNavLink>
                        </ConditionalTooltip>
                    ))
                }
            </List>

            <Divider className={classes.divider} />
            <List>
                <ThemeTypeSwitch isSideNavOpen={isSideNavOpen} />
                <LanguageMenu isSideNavOpen={isSideNavOpen} />
            </List>
        </>
    );
}

const useStyles = makeStyles({
    divider: {
        marginTop: 'auto',
    },
});
