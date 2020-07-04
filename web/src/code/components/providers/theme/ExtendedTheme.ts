import React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';


declare module '@material-ui/core/styles/createMuiTheme' {

    interface Theme {
        sideNavDrawer: {
            width: React.CSSProperties['width'];
        }
    }

    interface ThemeOptions {
        sideNavDrawer?: {
            width?: React.CSSProperties['width'];
        }
    }

}
