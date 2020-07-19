import { Service } from 'typedi';
import { FileUpload } from 'graphql-upload';
import { Storage } from '@google-cloud/storage';

import { ResourceData } from '../../resolvers/common/output/ResourceData';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';


export interface ResourceUpload extends FileUpload {
    userId: string;
    directory: 'public' | string;
    metadata?: {
        description: string;
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

    async uploadResource(resource: ResourceUpload) {
        const filePath = `${resource.userId}/${resource.directory}/${resource.filename}`;
        return new Promise<void>((resolve, reject) => (
            resource.createReadStream()
                .pipe(
                    this.bucket.file(filePath).createWriteStream({
                        resumable: false,
                        gzip: true,
                        public: (resource.directory === 'public'),
                        metadata: { metadata: resource.metadata },
                    }),
                )
                .on('error', reject)
                .on('finish', resolve)
        ));
    }

    async getResources(userId: string, directory: 'public' | string, prefix?: string): Promise<ResourceData[]> {
        try {
            const [ files ] = await this.bucket.getFiles({
                prefix: `${userId}/${directory}/${prefix || ''}`,
            });

            if (directory === 'public') {
                return files.map((file) => ({
                    url: `${file.bucket.storage.apiEndpoint}/${file.bucket.id}/${file.name}`,
                    ...file.metadata.metadata,
                }));
            }

            return await Promise.all(files.map(async (file) => {
                const [ url ] = await file.getSignedUrl({
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 1000 * 60 * 60, // one hour
                });
                return {
                    url,
                    ...file.metadata.metadata,
                };
            }));
        } catch (error) {
            logger.error(`Cannot get files from ${userId}/${directory}/`, error);
            return [];
        }
    }

}
