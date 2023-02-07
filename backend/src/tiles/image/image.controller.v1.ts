/* eslint-disable prettier/prettier */
import {
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GridFSFile, ObjectId } from 'mongodb';
import { Response } from 'express';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { FindImageParamsDto } from './dto/find-image-params.dto';
import { NotFound } from '../../util/not-found.decorator';
@Controller({
  version: '1',
  path: 'tile/image',
})
export class ImageControllerV1 {
  private logger = new Logger(ImageControllerV1.name);

  constructor(private imageService: ImageService) {
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    return image;
  }

  @Get()
  @NotFound()
  async getImageList(): Promise<GridFSFile[]> {
    return this.imageService.findImages();
  }

  @Get(':id')
  @NotFound()
  @Public()
  async getImage(@Param() params: FindImageParamsDto, @Res() res: Response) {
    let contentType = (await this.imageService.getImageInformation(params.id)).contentType;
    res.set({
      'Content-Type': `${contentType}`,
    });
    const file = await this.imageService.findImage(params.id);
    return file.pipe(res);
  }

  @Delete(':id')
  @NotFound()
  async deleteImage(@Param() params: FindImageParamsDto): Promise<GridFSFile> {
    return this.imageService.deleteImage(params.id);
  }
}
