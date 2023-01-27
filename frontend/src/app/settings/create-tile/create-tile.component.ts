import { Component, ElementRef, Sanitizer, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TilesService } from 'src/app/create-edit/tile-selection/tiles.service';
import { Tile } from 'src/app/create-edit/tile/dto/tile.dto';
import { CreateTileService } from './create-tile.service';


@Component({
  selector: 'app-create-tile',
  templateUrl: './create-tile.component.html',
  styleUrls: ['./create-tile.component.scss']
})

export class CreateTileComponent {
  @ViewChild('fileChooser') private input!: ElementRef;
  @ViewChild('basicModal') basicModal: ElementRef | undefined;

  public toUpload!: File | null;

  tiles: Tile[] = [];

  fileSrc: any;
  uploadActive: boolean = false;

  name: string = '';
  value: number = 0;
  paths: { from: number; to: number; layer: number }[] = [{ from: 0, to: 0, layer: 0}];

  directions: string[] = ['oben', 'rechts', 'unten', 'links'];

  rampChecked: boolean = false;

  constructor(
    private createTileService : CreateTileService,
    private toastr : ToastrService,
    private modalService: NgbModal,
    private tilesService: TilesService,
    private sanitizer: DomSanitizer) {}


    ngOnInit(): void {
      this.tilesService.getTiles().subscribe((tiles: Tile[]) => {
        let loaded = 0;
        tiles.forEach((tile: Tile) => {
          this.tilesService.getTileImg(tile.imageId!).subscribe((blob: Blob) => {
            let objectURL = URL.createObjectURL(blob);
            let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            tile.image = img;
            tile.rotation = 0;
            loaded++;
            this.tiles.push(tile);
          });

        });
      });
    }

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

  readUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event:any) => {
          this.fileSrc = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
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

  openModal(open: boolean) {
    if(open) {
      this.modalService.open(this.basicModal, {centered: true}).result
      .then((result) => {
      }, (reason) => {
        this.fileSrc = '';
        this.toastr.error('Hochladen abgebrochen');
      });
    } else {
      this.modalService.dismissAll();
    }
  }
}
