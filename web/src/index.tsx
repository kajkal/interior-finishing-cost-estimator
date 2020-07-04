import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';

import './styles/index.scss';

import * as serviceWorker from './serviceWorker';
import { ApolloContextProvider } from './code/components/providers/apollo/ApolloContextProvider';
import { I18nContextProvider } from './code/components/providers/i18n/I18nContextProvider';
import { SnackbarContextProvider } from './code/components/providers/snackbars/SnackbarContextProvider';
import { DynamicThemeProvider } from './code/components/providers/theme/DynamicThemeProvider';
import { App } from './code/App';


ReactDOM.render(
    <RecoilRoot>
        <ApolloContextProvider>
            <I18nContextProvider>
                <BrowserRouter>
                    <DynamicThemeProvider>
                        <CssBaseline />
                        <SnackbarContextProvider>
                            <App />
                        </SnackbarContextProvider>
                    </DynamicThemeProvider>
                </BrowserRouter>
            </I18nContextProvider>
        </ApolloContextProvider>
    </RecoilRoot>
    ,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
