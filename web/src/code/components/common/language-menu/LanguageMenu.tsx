import React from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '@material-ui/core/IconButton/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import LanguageIcon from '@material-ui/icons/Language';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import { supportedLanguages } from '../../../config/supportedLanguages';


export function LanguageMenu(): React.ReactElement {
    const [ anchorEl, setAnchorEl ] = React.useState<HTMLButtonElement | null>(null);
    const { t, i18n } = useTranslation();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={t('common.changeLanguage')!}>
                <IconButton
                    aria-label={t('common.changeLanguage')!}
                    aria-controls='lng-menu'
                    aria-haspopup='true'
                    onClick={handleClick}
                >
                    <LanguageIcon />
                </IconButton>
            </Tooltip>

            <Menu
                id='lng-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {
                    supportedLanguages.map(({ code, name }) => (
                        <MenuItem
                            key={code}
                            selected={code === i18n.language}
                            onClick={async () => {
                                await i18n.changeLanguage(code);
                                handleClose();
                            }}
                        >
                            {name}
                        </MenuItem>
                    ))
                }
            </Menu>
        </>
    );
}
