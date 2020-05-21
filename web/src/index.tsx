import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { CssBaseline, ThemeProvider } from '@material-ui/core';

import './styles/index.scss';

import * as serviceWorker from './serviceWorker';
import { SnackbarContextProvider } from './code/components/snackbars/SnackbarContextProvider';
import { authService } from './code/services/auth/AuthService';
import { theme } from './code/config/theme';
import { App } from './code/App';


const client = new ApolloClient({
    uri: `${process.env.REACT_APP_SERVER_URL}/graphql`,
    credentials: 'include',
    request: authService.prepareRequest.bind(authService),
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <SnackbarContextProvider>
                    <App />
                </SnackbarContextProvider>
            </ThemeProvider>
        </BrowserRouter>
    </ApolloProvider>
    ,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
