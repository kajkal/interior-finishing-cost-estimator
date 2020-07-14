import { makeStyles } from '@material-ui/core/styles';


export const useSideNavListItemStyles = makeStyles((theme) => ({
    listItemText: {
        [ theme.breakpoints.up('sm') ]: {
            marginLeft: 24,
            transition: theme.transitions.create('margin-left', {
                easing: theme.transitions.easing.easeIn,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
    listItemTextInner: {
        [ theme.breakpoints.up('sm') ]: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    },
    listItemTextShow: {
        [ theme.breakpoints.up('sm') ]: {
            marginLeft: 0,
        },
    },
    listItem: {
        [ theme.breakpoints.up('sm') ]: {
            opacity: 0,
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.easeIn,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
    listItemShow: {
        [ theme.breakpoints.up('sm') ]: {
            opacity: 1,
        },
    },
    // nested collapsible list item
    nested: {
        paddingLeft: theme.spacing(7),
    },
    menu: {
        // necessary for menu to be on top of snackbar/toast
        zIndex: `${theme.zIndex.snackbar + 1}!important` as unknown as number,
    },
}));
