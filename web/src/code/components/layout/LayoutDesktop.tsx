import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';

import { useSideNavController } from '../atoms/side-nav/useSideNavController';


export interface LayoutDesktopProps {
    content: React.ReactNode;
    sideNav: React.ReactNode;
    title: React.ReactNode;
}

export function LayoutDesktop({ content, sideNav, title }: LayoutDesktopProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { isSideNavOpen, onSideNavToggle } = useSideNavController();

    return (
        <div className={classes.root}>
            <AppBar
                position='fixed'
                className={clsx(classes.appBar, {
                    [ classes.appBarShift ]: isSideNavOpen,
                })}
            >
                <Toolbar>
                    <IconButton
                        color='inherit'
                        aria-label={t('common.expandSideNav')}
                        onClick={onSideNavToggle}
                        edge='start'
                        className={clsx(classes.menuButton, {
                            [ classes.hide ]: isSideNavOpen,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' noWrap>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant='permanent'
                className={clsx(classes.drawer, {
                    [ classes.drawerOpen ]: isSideNavOpen,
                    [ classes.drawerClose ]: !isSideNavOpen,
                })}
                classes={{
                    paper: clsx({
                        [ classes.drawerOpen ]: isSideNavOpen,
                        [ classes.drawerClose ]: !isSideNavOpen,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton
                        color='inherit'
                        aria-label={t('common.collapseSideNav')}
                        onClick={onSideNavToggle}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                </div>
                {sideNav}
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {content}
            </main>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create([ 'width', 'margin' ], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: theme.sideNavDrawer.width,
        width: `calc(100% - ${theme.sideNavDrawer.width}px)`,
        transition: theme.transitions.create([ 'width', 'margin' ], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(4),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: theme.sideNavDrawer.width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        overflowX: 'hidden',
        width: theme.sideNavDrawer.width,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(9) + 1,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));
