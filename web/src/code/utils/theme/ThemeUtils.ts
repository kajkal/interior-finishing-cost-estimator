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
                    main: '#1976d2', // #5C8C0D
                },
                secondary: pink,
                type: themeType,
            },
            props: {
                MuiButton: {
                    disableElevation: true,
                    size: 'large',
                },
            },
            typography: {
                button: {
                    textTransform: 'none',
                    fontWeight: 'normal',
                },
            },
            sideNavDrawer: {
                width: 240,
            }
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
        };

        return theme;
    }

    static toggleThemeType(previousThemeType: ThemeType): ThemeType {
        return (previousThemeType === ThemeType.light) ? ThemeType.dark : ThemeType.light;
    }

}
