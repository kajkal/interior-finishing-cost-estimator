import React from 'react';
import clsx from 'clsx';
import { useRecoilValue } from 'recoil/dist';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import MuiLinearProgress from '@material-ui/core/LinearProgress';

import { pageProgressAtom } from '../../atoms/page-progress/pageProgressAtom';
import { ThemeType } from '../../../utils/theme/ThemeUtils';


/**
 * Page linear progress - could be trigger by direct operations on pageProgressAtom
 * or by mounting PageLinearProgressRevealer component in DOM.
 */
export function PageLinearProgress(): React.ReactElement {
    const classes = useStyles();
    const { palette: { type } } = useTheme();
    const isPageLoading = useRecoilValue(pageProgressAtom);

    return (
        <MuiLinearProgress
            className={clsx(classes.root, {
                [ classes.hidden ]: !isPageLoading,
            })}
            color={(type === ThemeType.light) ? 'primary' : 'secondary'}
        />
    );
}


const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: '100%',
        right: 0,
        left: 0,
    },
    hidden: {
        visibility: 'hidden',
    },
});
