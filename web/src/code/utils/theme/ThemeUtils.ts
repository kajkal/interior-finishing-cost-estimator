import { createMuiTheme, responsiveFontSizes, Theme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';


export enum ThemeType {
    light = 'light',
    dark = 'dark',
}

/**
 * Class with Theme related methods.
 */
export class ThemeUtils {

    static readonly themes: Record<ThemeType, Theme> = {
        light: ThemeUtils.createTheme(ThemeType.light),
        dark: ThemeUtils.createTheme(ThemeType.dark),
    };

    private static createTheme(themeType: ThemeType): Theme {
        const theme = responsiveFontSizes(createMuiTheme({
            palette: {
                primary: {
                    main: (themeType === ThemeType.light)
                        ? '#1976d2'
                        : '#90caf9',
                },
                secondary: pink,
                type: themeType,
            },
            props: {
                MuiButton: {
                    disableElevation: true,
                    size: 'large',
                },
                MuiDialog: {
                    disableBackdropClick: true,
                },
                MuiTooltip: {
                    arrow: true,
                },
            },
            typography: {
                button: {
                    textTransform: 'none',
                    fontWeight: 'normal',
                },
            },
            sideNavDrawer: {
                width: 255,
            },
        }));

        theme.overrides = {
            MuiAppBar: {
                colorPrimary: {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderBottom: '1px solid '.concat(theme.palette.divider),
                    boxShadow: 'none',
                },
            },
            MuiFilledInput: {
                root: {
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: theme.palette.text.disabled,
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                    transition: theme.transitions.create([ 'border-color' ]),
                    '&:hover': {
                        borderColor: theme.palette.text.primary,
                        backgroundColor: theme.palette.background.paper,
                        '@media (hover: none)': {
                            backgroundColor: theme.palette.background.paper,
                        },
                    },
                    '&$focused': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.background.paper,
                    },
                },
                input: {
                    '&:-webkit-autofill': {
                        borderRadius: 'inherit',
                    },
                },
            },
            MuiFormLabel: {
                root: {
                    '&$error': {
                        color: theme.palette.text.secondary,
                    },
                },
            },
            MuiListItemIcon: {
                root: {
                    minWidth: 'unset',
                    marginRight: theme.spacing(1.5),
                },
            },
            MuiListItemText: {
                inset: {
                    paddingLeft: theme.spacing(4.5),
                },
            },
            MuiListItemAvatar: {
                root: {
                    minWidth: 'unset',
                    marginRight: theme.spacing(1.5),
                },
            },
            // MuiAccordion: {
            //     root: {
            //         backgroundColor: 'unset',
            //         boxShadow: 'unset',
            //         '&:before': {
            //             display: 'none',
            //         },
            //         '&$expanded': {
            //             margin: 0,
            //         },
            //     },
            // },
            // MuiAccordionSummary: {
            //     root: {
            //         padding: theme.spacing(0, 2, 0, 0),
            //         '&$focused': {
            //             backgroundColor: 'transparent',
            //             textDecoration: 'underline',
            //         },
            //     },
            //     content: {
            //         alignItems: 'center',
            //         '&$expanded': {
            //             margin: '20px 0',
            //         },
            //     },
            // },
            // MuiAccordionDetails: {
            //     root: {
            //         padding: theme.spacing(1, 1, 2),
            //         [ theme.breakpoints.up('sm') ]: {
            //             padding: theme.spacing(1, 2, 2, 4.5),
            //         },
            //     },
            // },
            MuiDialogContent: {
                root: {
                    paddingBottom: theme.spacing(3),
                }
            },
        };

        return theme;
    }

    static toggleThemeType(previousThemeType: ThemeType): ThemeType {
        return (previousThemeType === ThemeType.light) ? ThemeType.dark : ThemeType.light;
    }

}
