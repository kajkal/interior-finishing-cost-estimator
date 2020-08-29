import { ReadStream } from 'fs';
import { Readable, Writable } from 'stream';
import { CreateWriteStreamOptions, Storage } from '@google-cloud/storage';

import { ResourceUpload, StorageService } from '../../../../src/services/storage/StorageService';


describe('StorageService class', () => {

    const mockBucket = jest.fn();

    beforeEach(() => {
        (Storage as unknown as jest.Mock).mockClear().mockReturnValue({
            bucket: mockBucket.mockClear(),
        });
    });

    describe('uploadResource method', () => {

        const mockFile = jest.fn();
        const mockCreateWriteStream = jest.fn();
        let uploadedDataChunks: string[] = [];

        beforeEach(() => {
            uploadedDataChunks = [];
            mockBucket.mockReturnValue({
                file: mockFile.mockClear(),
            });
            mockFile.mockImplementation((filePath: string) => {
                const fileData = {
                    name: filePath,
                    bucket: {
                        id: 'sampleBucketId',
                        storage: { apiEndpoint: 'https://sample.api.com' },
                    },
                    metadata: {},
                    getSignedUrl: () => [ 'sampleSignedUrl' ],
                    createWriteStream: mockCreateWriteStream.mockClear().mockImplementation((options: CreateWriteStreamOptions) => {
                        fileData.metadata = {
                            timeCreated: '2020-08-25T12:00:00.000Z',
                            ...options.metadata,
                        };
                        return new Writable({
                            write(chunk, encoding, callback) {
                                uploadedDataChunks.push(chunk.toString());
                                if (chunk.toString() === 'error') {
                                    callback(new Error('Ups... Error!'));
                                } else {
                                    callback();
                                }
                            },
                        });
                    }),
                };
                return fileData;
            });
        });

        function createSampleResource(dataGenerator: AsyncIterable<any>, options?: Partial<ResourceUpload>): ResourceUpload {
            return {
                createReadStream: () => Readable.from(dataGenerator) as ReadStream,
                filename: 'sampleFilename.txt',
                mimetype: '',
                encoding: '',
                userId: 'sampleUserId',
                directory: 'sampleDirectory',
                ...options,
            };
        }

        async function* sampleDataGenerator() {
            yield 'chunk_1';
            yield 'chunk_2';
        }

        async function* sampleDataWithErrorGenerator() {
            yield 'chunk_1';
            yield 'error';
            yield 'chunk_2';
        }

        it('should return uploaded resource data when file is uploaded successfully', async () => {
            const resource = createSampleResource(sampleDataGenerator(), {
                filename: 'sampleFilename.txt',
                userId: 'sampleUserId',
                directory: 'sampleDirectory',
            });
            const resourceData = await new StorageService().uploadResource(resource);

            // verify if good storage bucket name was used
            expect(mockBucket).toHaveBeenCalledTimes(1);
            expect(mockBucket).toHaveBeenCalledWith('GOOGLE_STORAGE_BUCKET_NAME_TEST_VALUE');

            // verify file path
            expect(mockFile).toHaveBeenCalledTimes(1);
            expect(mockFile).toHaveBeenCalledWith('sampleUserId/sampleDirectory/sampleFilename.txt');

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith({
                resumable: false,
                gzip: true,
                public: false,
                metadata: { metadata: undefined },
            });

            // verify uploaded data
            expect(uploadedDataChunks).toEqual([ 'chunk_1', 'chunk_2' ]);

            // verify result
            expect(resourceData).toEqual({
                name: 'sampleFilename.txt',
                url: 'sampleSignedUrl',
                createdAt: new Date('2020-08-25T12:00:00.000Z'),
            });
        });

        it('should throw error when file is not uploaded successfully', async (done) => {
            const resource = createSampleResource(sampleDataWithErrorGenerator(), {
                filename: 'sampleFilename.txt',
                userId: 'sampleUserId',
                directory: 'sampleDirectory',
            });

            try {
                await new StorageService().uploadResource(resource);
            } catch (error) {
                expect(error).toHaveProperty('message', 'Ups... Error!');

                // verify uploaded data
                expect(uploadedDataChunks).toEqual([ 'chunk_1', 'error' ]);
                done();
            }
        });

        it('should mark file as public when directory is \'public\'', async () => {
            const resource = createSampleResource(sampleDataGenerator(), { directory: 'public' });
            const resourceData = await new StorageService().uploadResource(resource);

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith(expect.objectContaining({
                public: true,
            }));

            // verify result
            expect(resourceData).toEqual({
                name: 'sampleFilename.txt',
                url: 'https://sample.api.com/sampleBucketId/sampleUserId/public/sampleFilename.txt',
                createdAt: new Date('2020-08-25T12:00:00.000Z'),
            });
        });

        it('should mark file as private when directory is not \'public\'', async () => {
            const resource = createSampleResource(sampleDataGenerator(), { directory: 'sampleDirectory' });
            const resourceData = await new StorageService().uploadResource(resource);

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith(expect.objectContaining({
                public: false,
            }));

            // verify result
            expect(resourceData).toEqual({
                url: 'sampleSignedUrl',
                name: 'sampleFilename.txt',
                createdAt: new Date('2020-08-25T12:00:00.000Z'),
            });
        });

        it('should add resource description as file metadata when file description is defined', async () => {
            const resource = createSampleResource(sampleDataGenerator(), {
                metadata: { description: 'sampleDescription' },
            });
            const resourceData = await new StorageService().uploadResource(resource);

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith(expect.objectContaining({
                metadata: { metadata: { description: 'sampleDescription' } },
            }));

            // verify result
            expect(resourceData).toEqual({
                url: 'sampleSignedUrl',
                name: 'sampleFilename.txt',
                description: 'sampleDescription',
                createdAt: new Date('2020-08-25T12:00:00.000Z'),
            });
        });

    });

    describe('getResources method', () => {

        const mockGetFiles = jest.fn();

        beforeEach(() => {
            mockBucket.mockReturnValue({
                getFiles: mockGetFiles.mockClear(),
            });
        });

        it('should return simple url when resource is public', async () => {
            mockGetFiles.mockReturnValue([ [
                {
                    name: 'sampleUserId/public/avatar.png',
                    bucket: {
                        id: 'sampleBucketId',
                        storage: {
                            apiEndpoint: 'https://sample.api.com',
                        },
                    },
                    metadata: {
                        timeCreated: '2020-08-25T12:00:00.000Z',
                        metadata: {
                            description: 'sampleDescription',
                        },
                    },
                },
            ] ]);
            const resources = await new StorageService().getResources('sampleUserId', 'public', 'avatar');

            // verify search prefix
            expect(mockGetFiles).toHaveBeenCalledTimes(1);
            expect(mockGetFiles).toHaveBeenCalledWith({
                prefix: 'sampleUserId/public/avatar',
            });

            // verify result
            expect(resources).toEqual([ {
                url: 'https://sample.api.com/sampleBucketId/sampleUserId/public/avatar.png',
                name: 'avatar.png',
                description: 'sampleDescription',
                createdAt: new Date('2020-08-25T12:00:00.000Z'),
            } ]);
        });

        it('should acquire signed url and return it when resource is not public', async () => {
            const mockGetSignedUrl = jest.fn().mockResolvedValue([ 'sampleSignedUrl' ]);
            mockGetFiles.mockReturnValue([ [
                {
                    name: 'sampleUserId/protected/sampleFile2.pdf',
                    getSignedUrl: mockGetSignedUrl,
                    metadata: {
                        updated: '2020-07-23T16:08:06.019Z',
                        timeCreated: '2020-07-23T16:08:06.019Z',
                    },
                },
                {
                    name: 'sampleUserId/protected/sampleFile1.pdf',
                    getSignedUrl: mockGetSignedUrl,
                    metadata: {
                        updated: '2020-07-23T16:07:06.019Z',
                        timeCreated: '2020-07-23T16:07:06.019Z',
                    },
                },
            ] ]);
            const resources = await new StorageService().getResources('sampleUserId', 'protected');

            // verify search prefix
            expect(mockGetFiles).toHaveBeenCalledTimes(1);
            expect(mockGetFiles).toHaveBeenCalledWith({
                prefix: 'sampleUserId/protected/',
            });

            // verify signed url options
            expect(mockGetSignedUrl).toHaveBeenCalledTimes(2);
            expect(mockGetSignedUrl).toHaveBeenCalledWith({
                version: 'v4',
                action: 'read',
                expires: expect.any(Number),
            });

            // verify result
            expect(resources).toEqual([
                {
                    url: 'sampleSignedUrl',
                    name: 'sampleFile1.pdf',
                    description: undefined,
                    createdAt: new Date('2020-07-23T16:07:06.019Z'),
                },
                {
                    url: 'sampleSignedUrl',
                    name: 'sampleFile2.pdf',
                    description: undefined,
                    createdAt: new Date('2020-07-23T16:08:06.019Z'),
                },
            ]);
        });

        it('should throw error when cannot get resources data', async (done) => {
            mockGetFiles.mockImplementation(() => {
                throw new Error('Ups... Error!');
            });

            try {
                await new StorageService().getResources('sampleUserId', 'protected');
            } catch (error) {
                expect(error).toHaveProperty('message', 'Ups... Error!');
                done();
            }
        });

    });

    describe('deleteResources method', () => {

        const mockDeleteFiles = jest.fn();

        beforeEach(() => {
            mockBucket.mockReturnValue({
                deleteFiles: mockDeleteFiles.mockClear(),
            });
        });

        it('should delete files', async () => {
            await new StorageService().deleteResources('sampleUserId', 'public', 'avatar');

            // verify search prefix
            expect(mockDeleteFiles).toHaveBeenCalledTimes(1);
            expect(mockDeleteFiles).toHaveBeenCalledWith({
                prefix: 'sampleUserId/public/avatar',
            });
        });

        it('should throw error when cannot delete resources data', async (done) => {
            mockDeleteFiles.mockImplementation(() => {
                throw new Error('Ups... Error!');
            });

            try {
                await new StorageService().deleteResources('sampleUserId', 'public', 'avatar');
            } catch (error) {
                expect(error).toHaveProperty('message', 'Ups... Error!');
                done();
            }
        });

    });

});
