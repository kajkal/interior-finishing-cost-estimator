import React from 'react';
import { LinkElementProps } from '@udecode/slate-plugins';
import Link from '@material-ui/core/Link';


export function LinkElement({ children, attributes, element }: LinkElementProps): React.ReactElement {
    return (
        <Link {...attributes} href={element.url}>{children}</Link>
    );
}
