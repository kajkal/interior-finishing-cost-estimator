import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';

import './styles/index.scss';
import './code/config/i18n'; // initialize i18n instance

import * as serviceWorker from './serviceWorker';
import { ApolloContextProvider } from './code/components/providers/apollo/ApolloContextProvider';
import { ToastContextProvider } from './code/components/providers/toast/ToastContextProvider';
import { DynamicThemeProvider } from './code/components/providers/theme/DynamicThemeProvider';
import { BackdropSpinner } from './code/components/common/progress-indicators/BackdropSpinner';
import { Navigator } from './code/components/navigation/Navigator';
import { Layout } from './code/components/layout/Layout';
import { Modals } from './code/components/modals/Modals';


ReactDOM.render(
    <RecoilRoot>
        <BrowserRouter>
            <React.Suspense fallback={<BackdropSpinner />}>
                <ApolloContextProvider>
                    <DynamicThemeProvider>
                        <CssBaseline />
                        <ToastContextProvider>
                            <Layout>
                                <Navigator />
                            </Layout>
                            <Modals/>
                        </ToastContextProvider>
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
