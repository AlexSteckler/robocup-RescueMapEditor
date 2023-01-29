export interface Image {
  readonly _id: string;
  readonly filename: string;
  readonly uploadDate: string;
  readonly contentType: string;
  readonly length: number;
  readonly chunkSize: number;
  readonly metadata: any;
}
