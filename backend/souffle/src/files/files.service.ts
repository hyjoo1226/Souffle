import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      console.error('AWS 환경 변수가 설정되지 않았습니다:', {
        region,
        accessKeyId: !!accessKeyId,
        secretAccessKey: !!secretAccessKey,
      });
      throw new Error('AWS 환경 변수가 올바르게 설정되지 않았습니다');
    }

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
      'default-bucket-name';
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    problemId: number,
    submissionId: number,
  ): Promise<string> {
    const key = `${problemId}/${userId}/${submissionId}/${Date.now()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
  }
}
