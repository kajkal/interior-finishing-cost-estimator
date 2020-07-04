import React from 'react';
import { useTranslation } from 'react-i18next';

import Hidden from '@material-ui/core/Hidden';

import { SideNav } from '../navigation/SideNav';
import { LayoutDesktop } from './LayoutDesktop';
import { LayoutMobile } from './LayoutMobile';


export interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.ReactElement {
    const { t } = useTranslation();
    return (
        <>
            <Hidden smUp>
                <LayoutMobile
                    content={children}
                    sideNav={<SideNav />}
                    title={t('common.appName')}
                />
            </Hidden>
            <Hidden xsDown>
                <LayoutDesktop
                    content={children}
                    sideNav={<SideNav />}
                    title={t('common.appName')}
                />
            </Hidden>
        </>
    );
}
