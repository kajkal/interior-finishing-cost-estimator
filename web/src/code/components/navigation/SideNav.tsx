import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';

import { useSideNavController } from '../atoms/side-nav/useSideNavController';
import { ProjectsCollapsibleList } from './protected/ProjectsCollapsibleList';
import { AccountCollapsibleList } from './protected/AccountCollapsibleList';
import { SimpleNavigationItem } from './basic/SimpleNavigationItem';
import { useUserData } from '../../utils/hooks/useUserData';
import { ThemeTypeSwitch } from './public/ThemeTypeSwitch';
import { LanguageMenu } from './public/LanguageMenu';
import { nav } from '../../config/nav';


export function SideNav(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { userData } = useUserData();
    const { isSideNavOpen, onSideNavToggle } = useSideNavController();

    return (
        <>
            <Divider />
            {
                (userData)
                    ? (
                        <List>
                            <AccountCollapsibleList
                                isSideNavOpen={isSideNavOpen}
                                onSideNavToggle={onSideNavToggle}
                                userName={userData.name}
                            />
                            <ProjectsCollapsibleList
                                isSideNavOpen={isSideNavOpen}
                                onSideNavToggle={onSideNavToggle}
                                projects={userData.projects}
                            />
                            <SimpleNavigationItem
                                to={nav.products()}
                                label={t('common.products')}
                                ariaLabel={t('common.productsAriaLabel')}
                                Icon={ShoppingBasketIcon}
                                isSideNavOpen={isSideNavOpen}
                            />
                            <SimpleNavigationItem
                                to={nav.inquiries()}
                                label={t('common.inquiries')}
                                ariaLabel={t('common.inquiriesAriaLabel')}
                                Icon={LocalOfferIcon}
                                isSideNavOpen={isSideNavOpen}
                            />
                        </List>
                    )
                    : (
                        <List>
                            <SimpleNavigationItem
                                to={nav.inquiries()}
                                label={t('common.inquiries')}
                                ariaLabel={t('common.inquiriesAriaLabel')}
                                Icon={LocalOfferIcon}
                                isSideNavOpen={isSideNavOpen}
                            />
                            <SimpleNavigationItem
                                to={nav.login()}
                                label={t('loginPage.logIn')}
                                Icon={LockOpenIcon}
                                isSideNavOpen={isSideNavOpen}
                            />
                            <SimpleNavigationItem
                                to={nav.signup()}
                                label={t('signupPage.signUp')}
                                Icon={PersonAddIcon}
                                isSideNavOpen={isSideNavOpen}
                            />
                        </List>
                    )
            }

            <Divider className={classes.divider} />
            <List>
                <ThemeTypeSwitch isSideNavOpen={isSideNavOpen} />
                <LanguageMenu isSideNavOpen={isSideNavOpen} />
            </List>
        </>
    );
}

const useStyles = makeStyles({
    divider: {
        marginTop: 'auto',
    },
});
