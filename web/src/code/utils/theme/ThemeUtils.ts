import { createMuiTheme, responsiveFontSizes, Theme } from '@material-ui/core/styles';
import { AutocompleteClassKey } from '@material-ui/lab/Autocomplete';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { Overrides } from '@material-ui/core/styles/overrides';
import pink from '@material-ui/core/colors/pink';


export enum ThemeType {
    light = 'light',
    dark = 'dark',
}

interface ExtendedOverrides extends Overrides {
    MuiAutocomplete?: Partial<StyleRules<AutocompleteClassKey>>;
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
            MuiDialogContent: {
                root: {
                    paddingBottom: theme.spacing(3),
                },
            },
            MuiContainer: {
                maxWidthXs: {
                    [ theme.breakpoints.up('xs') ]: {
                        maxWidth: 520,
                    },
                },
            },
            MuiDialog: {
                paperWidthSm: {
                    // for editor toolbar icons to be in one line at least on desktop
                    maxWidth: 680,
                },
            },
            MuiChip: {
                root: {
                    maxWidth: '100%',
                },
                clickable: {
                    '&:active': {
                        boxShadow: 'none',
                    },
                },
            },
            MuiAutocomplete: {
                paper: {
                    // in order to cover other inputs left/right borders
                    width: 'calc(100% + 2px)',
                    marginLeft: -1,
                },
            },
        } as ExtendedOverrides;

        return theme;
    }

    static toggleThemeType(previousThemeType: ThemeType): ThemeType {
        return (previousThemeType === ThemeType.light) ? ThemeType.dark : ThemeType.light;
    }

}
