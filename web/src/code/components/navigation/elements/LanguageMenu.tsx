import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LanguageIcon from '@material-ui/icons/Language';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import { supportedLanguages } from '../../../config/supportedLanguages';
import { ConditionalTooltip } from '../../common/data-display/ConditionalTooltip';


export interface LanguageMenuProps {
    isSideNavOpen: boolean;
}

export function LanguageMenu({ isSideNavOpen }: LanguageMenuProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const ellipsisIconRef = React.useRef<SVGSVGElement | null>(null);
    const [ anchorEl, setAnchorEl ] = React.useState<Element | null>(null);

    const handleOpen = () => {
        setAnchorEl(ellipsisIconRef.current);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <ConditionalTooltip condition={!isSideNavOpen} title={t('common.changeLanguage')!}>
                <ListItem
                    button
                    aria-label={t('common.changeLanguage')}
                    aria-controls='language-menu'
                    aria-haspopup='true'
                    onClick={handleOpen}
                >
                    <ListItemIcon>
                        <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText primary={supportedLanguages.find(l => l.code === i18n.language)!.name} />
                    <MoreVertIcon
                        ref={ellipsisIconRef}
                        className={clsx(classes.listItemSecondary, { [ classes.listItemSecondaryShow ]: isSideNavOpen })}
                    />
                </ListItem>
            </ConditionalTooltip>
            <Menu
                id='language-menu'
                anchorEl={anchorEl}
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

const useStyles = makeStyles((theme) => ({
    listItemSecondary: {
        opacity: 0,
        transition: theme.transitions.create('opacity', {
            easing: theme.transitions.easing.easeIn,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    listItemSecondaryShow: {
        opacity: 1,
    },
}));
