import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';

import './styles/index.scss';
import './code/config/i18n'; // initialize i18n instance

import * as serviceWorker from './serviceWorker';
import { ApolloContextProvider } from './code/components/providers/apollo/ApolloContextProvider';
import { SnackbarContextProvider } from './code/components/providers/snackbars/SnackbarContextProvider';
import { DynamicThemeProvider } from './code/components/providers/theme/DynamicThemeProvider';
import { BackdropSpinner } from './code/components/common/progress-indicators/BackdropSpinner';
import { Routes } from './code/components/navigation/Routes';
import { Layout } from './code/components/layout/Layout';


ReactDOM.render(
    <RecoilRoot>
        <BrowserRouter>
            <React.Suspense fallback={<BackdropSpinner />}>
                <ApolloContextProvider>
                    <DynamicThemeProvider>
                        <CssBaseline />
                        <SnackbarContextProvider>
                            <Layout>
                                <Routes />
                            </Layout>
                        </SnackbarContextProvider>
                    </DynamicThemeProvider>
                </ApolloContextProvider>
            </React.Suspense>
        </BrowserRouter>
    </RecoilRoot>
    ,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
