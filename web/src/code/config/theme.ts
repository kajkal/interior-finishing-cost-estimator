import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';


export const theme = responsiveFontSizes(createMuiTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: pink,
        // type: 'dark',
    }
}));

