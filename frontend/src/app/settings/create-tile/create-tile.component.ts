import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CreateTileService } from './create-tile.service';

@Component({
  selector: 'app-create-tile',
  templateUrl: './create-tile.component.html',
  styleUrls: ['./create-tile.component.scss']
})
export class CreateTileComponent {
  @ViewChild('fileChooser') private input!: ElementRef;
  public toUpload!: File | null;
  uploadActive: boolean = false;

  name: string = '';
  value: number = 0;
  paths: { from: number; to: number; layer: number }[] = [{ from: 0, to: 0, layer: 0}];

  constructor(private createTileService : CreateTileService, private toastr : ToastrService) { }

  addDeletePath(add : boolean) {
    if(this.paths.length < 4 && add) {
      this.paths.push({ from: 0, to: 0, layer: 0 });
    } else if (!add) {
      this.paths.pop();
    }
  }

  onFileSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files?.item(
      0
    ) as File;
    if (file) {
      this.toUpload = file;
      this.uploadActive = true;
    }
  }

  create() {
    if(this.toUpload) {
      this.createTileService.uploadImage(this.toUpload).subscribe((image) => {

        let dto : any = {
          name: this.name,
          value: this.value,
          paths: this.paths,
          imageId: (image as any).id
        }

        this.createTileService.createTile(dto).subscribe(() => {
          this.value = 0;
          this.toUpload = null;
          this.uploadActive = false;
          this.input.nativeElement.value = '';
          this.toastr.success('Tile created');
        });
      });
    }
  }

}
