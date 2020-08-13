import React from 'react';
import Grow from '@material-ui/core/Grow';
// import Fade from '@material-ui/core/Fade';
import { TransitionProps } from '@material-ui/core/transitions/transition';


export interface PageEnterTransitionProps extends TransitionProps {
    children: React.ReactElement;
}

export function PageEnterTransition({ children, in: inProp = true, ...rest }: PageEnterTransitionProps): React.ReactElement {
    return (
        <Grow in={inProp} style={{ transformOrigin: 'top left' }} {...rest}>
            {children}
        </Grow>
    );
    // return (
    //     <Fade in={inProp} {...rest}>
    //         {children}
    //     </Fade>
    // );
}
