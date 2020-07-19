import { ReadStream } from 'fs';
import { Readable, Writable } from 'stream';
import { Storage } from '@google-cloud/storage';

import { MockLogger } from '../../../__mocks__/utils/logger';

import { ResourceUpload, StorageService } from '../../../../src/services/storage/StorageService';


describe('StorageService class', () => {

    let mockBucket = jest.fn();

    beforeEach(() => {
        MockLogger.setupMocks();
        (Storage as unknown as jest.Mock).mockClear().mockReturnValue({
            bucket: mockBucket.mockClear(),
        });
    });

    describe('uploadResource method', () => {

        let mockFile = jest.fn();
        let mockCreateWriteStream = jest.fn();
        let uploadedDataChunks: string[] = [];

        beforeEach(() => {
            uploadedDataChunks = [];
            mockBucket.mockReturnValue({
                file: mockFile.mockClear().mockReturnValue({
                    createWriteStream: mockCreateWriteStream.mockClear().mockReturnValue(new Writable({
                        write(chunk, encoding, callback) {
                            uploadedDataChunks.push(chunk.toString());
                            if (chunk.toString() === 'error') {
                                callback(new Error('Ups... Error!'));
                            } else {
                                callback();
                            }
                        },
                    })),
                }),
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

        it('should resolve promise when file is uploaded successfully', async () => {
            const resource = createSampleResource(sampleDataGenerator(), {
                filename: 'sampleFilename.txt',
                userId: 'sampleUserId',
                directory: 'sampleDirectory',
            });
            await new StorageService().uploadResource(resource);

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
        });

        it('should reject promise when file is not uploaded successfully', async (done) => {
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
            await new StorageService().uploadResource(resource);

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith(expect.objectContaining({
                public: true,
            }));
        });

        it('should mark file as private when directory is not \'public\'', async () => {
            const resource = createSampleResource(sampleDataGenerator(), { directory: 'sampleDirectory' });
            await new StorageService().uploadResource(resource);

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith(expect.objectContaining({
                public: false,
            }));
        });

        it('should add resource description as file metadata when description is defined', async () => {
            const resource = createSampleResource(sampleDataGenerator(), {
                metadata: { description: 'sampleDescription' },
            });
            await new StorageService().uploadResource(resource);

            // verify upload options
            expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
            expect(mockCreateWriteStream).toHaveBeenCalledWith(expect.objectContaining({
                metadata: { metadata: { description: 'sampleDescription' } },
            }));
        });

    });

    describe('getResources method', () => {

        let mockGetFiles = jest.fn();

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
                description: 'sampleDescription',
            } ]);
        });

        it('should acquire signed url and return it when resource is not public', async () => {
            const mockGetSignedUrl = jest.fn().mockResolvedValue([ 'sampleSignedUrl' ]);
            mockGetFiles.mockReturnValue([ [
                {
                    getSignedUrl: mockGetSignedUrl,
                    metadata: {},
                },
            ] ]);
            const resources = await new StorageService().getResources('sampleUserId', 'protected');

            // verify search prefix
            expect(mockGetFiles).toHaveBeenCalledTimes(1);
            expect(mockGetFiles).toHaveBeenCalledWith({
                prefix: 'sampleUserId/protected/',
            });

            // verify signed url options
            expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
            expect(mockGetSignedUrl).toHaveBeenCalledWith({
                version: 'v4',
                action: 'read',
                expires: expect.any(Number),
            });

            // verify result
            expect(resources).toEqual([ {
                url: 'sampleSignedUrl',
                description: undefined,
            } ]);
        });

        it('should log error and return empty array when error is thrown', async () => {
            mockGetFiles.mockImplementation(() => {
                throw new Error('Ups... Error!');
            });
            const resources = await new StorageService().getResources('sampleUserId', 'protected');

            // verify if error was logged
            expect(MockLogger.error).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledWith('Cannot get files from sampleUserId/protected/', expect.any(Error));

            // verify result
            expect(resources).toEqual([]);
        });

    });

});
