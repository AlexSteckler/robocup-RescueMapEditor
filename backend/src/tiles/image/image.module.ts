import { forwardRef, Module } from '@nestjs/common';
import { ImageControllerV1 } from './image.controller.v1';
import { ImageService } from './image.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { GridFsStorage } from 'multer-gridfs-storage';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        storage: new GridFsStorage({
          url: configService.get<string>('MONGO_URI'),
          file: (req, file: Express.Multer.File) => {
            return new Promise((resolve, reject) => {
              let fileInfos = {};
              try {
                fileInfos = {
                  filename: file.originalname.trim()
                };
              } catch (error) {
                reject(error);
              }
              resolve(fileInfos);
            });
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ImageControllerV1],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
