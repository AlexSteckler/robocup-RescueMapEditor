export interface Image {
  readonly id: string;
  readonly filename: string;
  readonly uploadDate: string;
  readonly contentType: string;
  readonly length: number;
  readonly chunkSize: number;
  readonly metadata: any;
}
