import { Service } from 'typedi';
import { FileUpload } from 'graphql-upload';
import { File, Storage } from '@google-cloud/storage';

import { ResourceData } from '../../resolvers/common/output/ResourceData';
import { config } from '../../config/config';


export interface ResourceUpload extends FileUpload {
    userId: string;
    directory: string; // 'public' is a special directory where all files are publicly available
    metadata?: {
        description: string | undefined;
    };
}

/**
 * Service responsible for operations on a file storage (images, project files etc).
 * Each user has own directory in storage with the following structure:
 *   /<userId> -> user directory
 *     /public -> public resources like user avatar
 *     /<project1Id> -> protected project resources
 *     /<project2Id>
 */
@Service()
export class StorageService {

    private readonly storage = new Storage();

    private get bucket() {
        return this.storage.bucket(config.gcp.storageBucketName);
    }

    async uploadResource(resource: ResourceUpload): Promise<ResourceData> {
        const isPublic = resource.directory === 'public';
        const filePath = `${resource.userId}/${resource.directory}/${resource.filename}`;
        const file = this.bucket.file(filePath);

        await new Promise<void>((resolve, reject) => (
            resource.createReadStream()
                .pipe(
                    file.createWriteStream({
                        resumable: false,
                        gzip: true,
                        public: isPublic,
                        metadata: { metadata: resource.metadata },
                    }),
                )
                .on('error', reject)
                .on('finish', resolve)
        ));

        return (isPublic)
            ? StorageService.getPublicResourceData(file)
            : await StorageService.getProtectedResourceData(file);
    }

    async getResources(userId: string, directory: string, prefix?: string): Promise<ResourceData[]> {
        const [ files ] = await this.bucket.getFiles({
            prefix: `${userId}/${directory}/${prefix || ''}`,
        });
        const sortedFilesByModificationDate = files.sort((a, b) => (
            (a.metadata.updated).localeCompare(b.metadata.updated)
        ));
        return (directory === 'public')
            ? sortedFilesByModificationDate.map(StorageService.getPublicResourceData)
            : await Promise.all(sortedFilesByModificationDate.map(StorageService.getProtectedResourceData));
    }

    async deleteResources(userId: string, directory: string, prefix?: string): Promise<void> {
        return await this.bucket.deleteFiles({
            prefix: `${userId}/${directory}/${prefix || ''}`,
        });
    }


    private static getPublicResourceData(file: File): ResourceData {
        const url = `${file.bucket.storage.apiEndpoint}/${file.bucket.id}/${file.name}`;
        return StorageService.createResourceData(file, url);
    }

    private static async getProtectedResourceData(file: File): Promise<ResourceData> {
        const [ url ] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60, // one hour
        });
        return StorageService.createResourceData(file, url);
    }

    private static createResourceData(file: File, url: string): ResourceData {
        return {
            url,
            name: file.name.split('/').slice(-1)[ 0 ],
            ...file.metadata.metadata,
        };
    }

}
