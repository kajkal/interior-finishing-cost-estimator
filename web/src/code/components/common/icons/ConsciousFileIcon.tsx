import React from 'react';

import { SvgIconProps } from '@material-ui/core/SvgIcon';

import { PdfIcon } from './file-extensions/PdfIcon';
import { ZipIcon } from './file-extensions/ZipIcon';
import { RarIcon } from './file-extensions/RarIcon';
import { TarIcon } from './file-extensions/TarIcon';
import { XlsIcon } from './file-extensions/XlsIcon';
import { DocIcon } from './file-extensions/DocIcon';
import { TxtIcon } from './file-extensions/TxtIcon';
import { ImageIcon } from './file-extensions/ImageIcon';
import { AudioIcon } from './file-extensions/AudioIcon';
import { OtherIcon } from './file-extensions/OtherIcon';


export interface ConsciousFileIconProps extends SvgIconProps {
    filename: string;
}

/**
 * Based on filename prop renders adequate file icon.
 */
export function ConsciousFileIcon({ filename, ...rest }: ConsciousFileIconProps): React.ReactElement {
    const FileIcon = getFileIcon(filename);
    return <FileIcon {...rest} />;
}

const fileExtensionIconMap = [
    [ /.pdf$/, PdfIcon ],
    [ /.zip$/, ZipIcon ],
    [ /.rar$/, RarIcon ],
    [ /.tar$/, TarIcon ],
    [ /.(xlsx?|ods)$/, XlsIcon ],
    [ /.(docx?|odt)$/, DocIcon ],
    [ /.txt$/, TxtIcon ],
    [ /.(jpg|png|bmp|webp)$/, ImageIcon ],
    [ /.(mp3|wma)$/, AudioIcon ],
] as const;

function getFileIcon(filename: string): React.ComponentType<SvgIconProps> {
    const matchingItem = fileExtensionIconMap.find(([ extRegExp ]) => extRegExp.test(filename));
    return matchingItem?.[ 1 ] || OtherIcon;
}
