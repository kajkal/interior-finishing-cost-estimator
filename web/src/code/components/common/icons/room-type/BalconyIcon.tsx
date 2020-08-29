import React from 'react';
import { useTranslation } from 'react-i18next';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';


export function BalconyIcon(props: SvgIconProps): React.ReactElement {
    const { t } = useTranslation();
    return (
        <SvgIcon
            viewBox='0 0 512 512'
            data-source='https://www.flaticon.com/free-icon/bird_692515'
            titleAccess={t('project.roomType.balcony')}
            {...props}
        >
            <path d='M501 334.3c-21-13.7-91.7-59.8-99.4-64.8 10.6-8.6 12.8-24.5 3.4-35.6-33-39.2-81.6-64.5-132.3-77.8-5.4-1.4-10.9-1.9-15.5-1.8l-86.9-82.8C155.1 57 135.1 50 115.5 51.2c-4.1.2-7.3 3.8-7.1 7.9.2 4.1 3.8 7.3 7.9 7 16.8-.9 31.7 4.9 43.5 16.2l79.2 75.5c-22.3 8.4-36 29.7-36 52.1 0 29 22.7 53.3 51.7 55.4 113.7 8 106.1 7.5 127.1 9.1 5.9 3.9 84.5 55.1 110.9 72.3 5.9 3.7 5.5 12.6-1 15.6l-20.5 9.7c-2.7 1.3-6 1.1-8.6-.5-11.3-7.3-75.6-49.4-91.1-59.5-6.6-4.3-15.1-3.9-21.3.9l-2.2 1.7-37.9 29.4c-3.3 2.5-3.9 7.3-1.3 10.5 2.5 3.3 7.3 3.9 10.5 1.3l42-32.6 93.1 60.8c3.4 2.2 8.1 3.8 12.9 3.8 8.6 0 12.5-4 30.7-11.9 17.5-7.8 18.7-31.6 3-41.6zm-114.2-74.4c-.1 0 4.5.3-130.9-9.4-21.2-1.5-37.7-19.3-37.7-40.4 0-19.3 13.8-36.6 33.6-40.1 9.7-1.7 16.3.4 24.7 2.8 44.7 12.8 86.8 35.4 117.1 70.9 5.5 6.5.5 15.8-6.8 16.2z' />
            <circle cx='113' cy='124.6' r='11.8' />
            <path d='M90.9 73.7c3.6-2 5-6.6 3-10.2-2-3.6-6.6-5-10.2-3-22.7 12.4-38 35.8-37.5 65.6-26 7.3-38.4 19.9-44.1 28.5-5.4 8.1.4 19.2 10.3 19.2l49.3-.2c3.9 5.6 8.6 10.8 13.9 15.4-15.5 32-18.4 67.5-10.6 99.6.8 3.4 3.9 5.7 7.3 5.7 4.9 0 8.5-4.6 7.3-9.3-7.9-32.4-3-66.5 12.1-94.5 1.8-3.3.9-7.3-2.1-9.5-37-28-39.4-85.1 1.3-107.3zm-73 85c4.9-5.4 13.9-12.5 30-17.4 1.2 6 3 11.7 5.4 17.2l-35.4.2zM297.2 364.1c-2.4-3.4-7.1-4.2-10.5-1.8-67.3 48-161.5 23.3-197.6-50.7-1.8-3.7-6.3-5.3-10-3.5-3.7 1.8-5.3 6.3-3.5 10 20.9 42.9 61.6 74.1 109.7 82v23.1h-35.6c-10.3 0-18.8 8.4-18.8 18.8 0 10 7.9 18.2 17.8 18.7h88.9c10.4 0 18.8-8.4 18.8-18.8 0-10.3-8.4-18.8-18.8-18.8h-15.9v-21.7c26.6-2.2 51.8-11.5 73.6-27 3.5-2.2 4.3-6.9 1.9-10.3zm-59.5 74.2c2 0 3.8 1.7 3.8 3.8 0 2-1.7 3.8-3.8 3.8h-88c-2 0-3.8-1.7-3.8-3.8 0-2 1.7-3.8 3.8-3.8h43.1c4.1 0 7.5-3.4 7.5-7.5v-29c2.2.1 4.3.2 6.5.3v28.7c0 4.1 3.4 7.5 7.5 7.5h23.4z' />
        </SvgIcon>
    );
}