/// <reference types="react-scripts" />


declare module 'googlemaps';

declare namespace NodeJS {

    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        REACT_APP_SERVER_URL: string;
        REACT_APP_GOOGLE_MAPS_API: string;
    }

}
