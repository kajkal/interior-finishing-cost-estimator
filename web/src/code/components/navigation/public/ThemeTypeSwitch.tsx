import React from 'react';
import clsx from 'clsx';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Switch from '@material-ui/core/Switch';

import { ConditionalTooltip } from '../../common/data-display/ConditionalTooltip';
import { useSideNavListItemStyles } from '../styles/useSideNavListItemStyles';
import { ThemeType, ThemeUtils } from '../../../utils/theme/ThemeUtils';
import { themeTypeAtom } from '../../atoms/theme-type/themeTypeAtom';


export interface ThemeTypeSwitchProps {
    isSideNavOpen: boolean;
}

export function ThemeTypeSwitch({ isSideNavOpen }: ThemeTypeSwitchProps): React.ReactElement {
    const listItemStyles = useSideNavListItemStyles();
    const { t } = useTranslation();
    const [ themeType, setThemeType ] = useRecoilState(themeTypeAtom);
    const accessibilityLabel = (themeType === ThemeType.light)
        ? t('common.switchToDarkTheme')
        : t('common.switchToLightTheme');

    const toggleThemeType = () => {
        setThemeType(ThemeUtils.toggleThemeType(themeType));
    };

    return (
        <ConditionalTooltip condition={!isSideNavOpen} title={accessibilityLabel}>
            <ListItem button onClick={toggleThemeType} aria-label={accessibilityLabel}>
                <ListItemIcon>
                    {(themeType === ThemeType.dark) ? <Brightness7Icon /> : <Brightness4Icon />}
                </ListItemIcon>
                <ListItemText
                    primary={t('common.darkTheme')}
                    className={clsx(listItemStyles.listItemText, {
                        [ listItemStyles.listItemTextShow ]: isSideNavOpen,
                    })}
                />
                <Switch
                    tabIndex={-1}
                    className={clsx(listItemStyles.listItem, {
                        [ listItemStyles.listItemShow ]: isSideNavOpen,
                    })}
                    edge='end'
                    readOnly
                    disableRipple
                    checked={(themeType === ThemeType.dark)}
                />
            </ListItem>
        </ConditionalTooltip>
    );
}
