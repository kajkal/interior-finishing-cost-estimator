import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@material-ui/core';

import './styles/index.scss';

import * as serviceWorker from './serviceWorker';
import { ApolloContextProvider } from './code/components/providers/apollo/ApolloContextProvider';
import { SnackbarContextProvider } from './code/components/providers/snackbars/SnackbarContextProvider';
import { theme } from './code/config/theme';
import { App } from './code/App';


ReactDOM.render(
    <ApolloContextProvider>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <SnackbarContextProvider>
                    <App />
                </SnackbarContextProvider>
            </ThemeProvider>
        </BrowserRouter>
    </ApolloContextProvider>
    ,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
