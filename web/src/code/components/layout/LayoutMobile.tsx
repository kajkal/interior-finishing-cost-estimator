import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';

import { useSideNavController } from '../atoms/side-nav/useSideNavController';


export interface LayoutMobileProps {
    content: React.ReactNode;
    sideNav: React.ReactNode;
    title: React.ReactNode;
}

export function LayoutMobile({ content, sideNav, title }: LayoutMobileProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { isSideNavOpen, onSideNavToggle } = useSideNavController();

    return (
        <div className={classes.root}>
            <AppBar position='fixed'>
                <Toolbar>
                    <IconButton
                        color='inherit'
                        aria-label={t('common.openSideNav')}
                        edge='start'
                        onClick={onSideNavToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' noWrap>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <SwipeableDrawer
                open={isSideNavOpen}
                onClose={onSideNavToggle}
                onOpen={onSideNavToggle}
                classes={{
                    paper: classes.drawerPaper,
                }}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <div className={classes.toolbar} />
                {sideNav}
            </SwipeableDrawer>
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
    menuButton: {
        marginRight: theme.spacing(2),
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: theme.sideNavDrawer.width,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));
