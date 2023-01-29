import { Component, ElementRef, Sanitizer, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TilesService } from 'src/app/create-edit/tile-selection/tiles.service';
import { Tile } from 'src/app/create-edit/tile/dto/tile.dto';
import { Image } from './dto/image.dto';


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

  selectedTile: Tile | undefined;

  fileSrc: any;

  name: string = '';
  value: number = 0;
  paths: { from: number; to: number; layer: number }[] = [{ from: 0, to: 0, layer: 0}];

  directions: string[] = ['oben', 'rechts', 'unten', 'links'];

  rampChecked: boolean = false;

  constructor(
    private toastr : ToastrService,
    private modalService: NgbModal,
    private tilesService: TilesService,
    private sanitizer: DomSanitizer) {}


  //--------------------------------------------------------------------------------

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

  //--------------------------------------------------------------------------------

  getTileFromId(selectedTile: Tile) {
    this.selectedTile = this.tiles.find((tile) => tile.id == selectedTile?.id);

    if (this.selectedTile) {
      this.name = this.selectedTile.name;
      this.value = this.selectedTile.value!;
      this.paths = this.selectedTile.paths!;
      this.fileSrc = this.selectedTile.image;
      this.openBasicModal();
    }
  }

  //--------------------------------------------------------------------------------

  addDeletePath(add : boolean) {
    if(this.paths.length < 4 && add) {
      this.paths.push({ from: 0, to: 0, layer: 0 });
    } else if (!add) {
      this.paths.pop();
    }
  }

  //--------------------------------------------------------------------------------

  onFileSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files?.item(
      0
    ) as File;
    if (file) {
      this.toUpload = file;
    }
  }

  //--------------------------------------------------------------------------------

  readUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event:any) => {
          this.fileSrc = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  //--------------------------------------------------------------------------------

  createTile() {
    if(this.toUpload) {
      this.tilesService.uploadImage(this.toUpload).subscribe((image) => {

        let tmpImageId = (image as any).id

        let dto : any = {
          name: this.name,
          value: this.value,
          paths: this.paths,
          imageId: tmpImageId
        }

        this.tilesService.createTile(dto).subscribe((resultTile: Tile) => {
          this.value = 0;
          this.toUpload = null;
          this.toastr.success('Tile created');

          if (!this.tiles.find((tile) => tile.id == resultTile.id)) {

            this.tilesService.getTileImg(tmpImageId).subscribe((blob: Blob) => {
              let objectURL = URL.createObjectURL(blob);
              let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
              resultTile.image = img;
              this.tiles.push(resultTile);
            });
          }
        });
      });
    }
  }

  //--------------------------------------------------------------------------------

  updateTile() {
    if (this.selectedTile && this.selectedTile.id) {
      let tileId = this.selectedTile.id;

      if (this.toUpload) {
        this.tilesService.uploadImage(this.toUpload).subscribe((image) => {
          let id = (image as any).id
          this.toUpload = null;

          let tileDto = {
            name: this.name,
            value: this.value,
            paths: this.paths,
            imageId: id
          }

          this.updateTileDto(tileId, tileDto);

        });
      } else {
        let tileDto = {
          name: this.name,
          value: this.value,
          paths: this.paths,
          imageId: this.selectedTile.imageId
        }

        this.updateTileDto(tileId, tileDto);
      }

      this.tilesService.getTileImg(tileId).subscribe((blob: Blob) => {
        let objectURL = URL.createObjectURL(blob);
        let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      });

      } else {
        this.toastr.error('Kachel nicht gefunden');
      }
    this.modalService.dismissAll();
  }

  updateTileDto(id: string, dto: any) {
    this.tilesService.updateTile(id, dto).subscribe((returnTile: Tile) => {
      this.value = 0;

      this.tilesService.getTileImg(returnTile.imageId!).subscribe((blob: Blob) => {
        let objectURL = URL.createObjectURL(blob);
        let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        returnTile.image = img;
      });

      let tileIndex = this.tiles.findIndex((tile) => tile.id == returnTile.id);
      this.tiles[tileIndex] = returnTile;
    });
    this.toastr.success('Tile updated');
  }

  openBasicModal() {
    this.modalService.open(this.basicModal, {centered: true}).result
    .then((result) => {
    }, (reason) => {
      this.fileSrc = '';
      this.name = '';
      this.paths = [{ from: 0, to: 0, layer: 0}];
      this.value = 0;
      this.toUpload = null;
      this.selectedTile = undefined;
    } );
  }
}
