import { HttpStatus } from '@nestjs/common/enums';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import {
  PutObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  REGION,
  YANDEX_CLOUD_ENDPOINT,
  YANDEX_CLOUD_STORAGE_HOSTNAME,
} from '../constants';
import { FILE_DELITION_ERROR } from '../errors';
import { CloudStrategy } from './cloud.strategy';

@Injectable()
export class YandexCloudStrategy extends CloudStrategy {
  private client: S3Client;

  private bucketName: string;

  public constructor(private readonly configService: ConfigService) {
    super();

    this.client = new S3Client({
      region: REGION,
      endpoint: YANDEX_CLOUD_ENDPOINT,
      credentials: {
        accessKeyId: <string>(
          this.configService.get<string>('YANDEX_STORAGE_API_KEY_ID')
        ),
        secretAccessKey: <string>(
          this.configService.get<string>('YANDEX_STORAGE_API_KEY')
        ),
      },
      forcePathStyle: true,
    });

    this.bucketName = <string>(
      this.configService.get<string>('YANDEX_BUCKET_NAME')
    );
  }

  public async upload(
    path: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: `${path}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const putObjectCommand = new PutObjectCommand(params);

    try {
      await this.client.send(putObjectCommand);

      const url = `https://${this.bucketName}.${YANDEX_CLOUD_STORAGE_HOSTNAME}/${path}`;

      return url;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'File loading failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async remove(path: string | string[]): Promise<void> {
    try {
      if (typeof path === 'string') {
        path = [path];
      }

      const params = {
        Bucket: this.bucketName,
        Delete: {
          Objects: path.map((p) => ({ Key: new URL(p).pathname.slice(1) })),
        },
      };
      const deleteCommand = new DeleteObjectsCommand(params);

      await this.client.send(deleteCommand);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(FILE_DELITION_ERROR);
    }
  }
}
