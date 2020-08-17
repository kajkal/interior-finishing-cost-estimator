import React from 'react';
import clsx from 'clsx';
import { useFocused, useSelected } from 'slate-react';
import { useInView } from 'react-intersection-observer';
import { ImageElementProps } from '@udecode/slate-plugins';
import { fade, makeStyles } from '@material-ui/core/styles';


export function ImageElement({ attributes, element: { url }, children, className }: ImageElementProps): React.ReactElement {
    const classes = useStyles();
    const focused = useFocused();
    const selected = useSelected();
    const [ ref, inView ] = useInView({
        triggerOnce: true,
        rootMargin: '150%',
    });

    return (
        <div {...attributes} className={className}>
            <div contentEditable={false} ref={ref}>
                <img
                    className={clsx(classes.image, {
                        [ classes.focused ]: focused,
                        [ classes.selected ]: selected,
                    })}
                    src={inView ? url : undefined}
                    alt='lazy loading image'
                    loading='lazy'
                />
            </div>
            {children}
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    image: {
        display: 'block',
        maxWidth: '100%',
        margin: theme.spacing(1, 0),
        outline: 'none',
        '&$focused': {
            '&$selected': {
                outline: '2px solid '.concat(fade(theme.palette.primary.main, 0.4)),
                outlineOffset: 1,
            },
        },
    },
    focused: {},
    selected: {},
}));
