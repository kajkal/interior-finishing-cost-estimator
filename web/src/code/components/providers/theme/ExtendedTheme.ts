import { Theme } from '@material-ui/core/styles/createMuiTheme';


declare module '@material-ui/core/styles/createMuiTheme' {

    interface Theme {
        sideNavDrawer: {
            width: number;
        }
    }

    interface ThemeOptions {
        sideNavDrawer?: {
            width?: number;
        }
    }

}
