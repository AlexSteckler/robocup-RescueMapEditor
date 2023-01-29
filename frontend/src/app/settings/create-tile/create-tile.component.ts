import { Component, ElementRef, Sanitizer, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TilesService } from 'src/app/create-edit/tile-selection/tiles.service';
import { Tile } from 'src/app/create-edit/tile/dto/tile.dto';

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
  locationTiles: Tile[] = [];

  selectedTile: Tile | undefined;

  tileImage: any;

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

          if (tile.location) {
            this.locationTiles.push(tile);
          } else {
            this.tiles.push(tile);
          }
        });
      });
    });
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
          this.tileImage = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  //--------------------------------------------------------------------------------

  createTile() {
    this.selectedTile = undefined;
    this.tileImage = undefined;

    this.name = '';
    this.paths = [{ from: 0, to: 0, layer: 0}];
    this.value = 0;
    this.toUpload = null;


    this.modalService.open(this.basicModal, {centered: true}).result
    .then((result) => {

      if(this.toUpload) {
        this.tilesService.uploadImage(this.toUpload).subscribe((image) => {

          let tileImage : any;

            if (this.toUpload instanceof Blob) {
              let objectURL = URL.createObjectURL(this.toUpload);
              tileImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            }

            let tileDto : any = {
              name: this.name,
              value: this.value,
              paths: this.paths,
              imageId: image.id
            }

            this.tilesService.createTile(tileDto).subscribe((resultTile: Tile) => {

              if (!this.tiles.find((tile) => tile.id == resultTile.id)) {
                resultTile.image = tileImage;
                if (resultTile.location) {
                  this.locationTiles.unshift(resultTile);
                } else {
                  this.tiles.unshift(resultTile);
                }
              }

              this.toastr.success('Kachel wurde erstellt');
            });
        });
      }
    }, (reason) => {
      this.toastr.warning('Kachel nicht erstellt');
    } );
  }

  //--------------------------------------------------------------------------------

  updateTile(selectedTile: Tile) {
    this.selectedTile = selectedTile;

    this.tileImage = selectedTile.image;
    this.name = selectedTile.name;
    this.value = selectedTile.value!;
    this.paths = selectedTile.paths!;

    this.modalService.open(this.basicModal, {centered: true}).result
    .then((result) => {
      let tileDto = {
        name: this.name,
        value: this.value,
        paths: this.paths,
        imageId: selectedTile.imageId
      }

      if (this.toUpload) {
        this.tilesService.uploadImage(this.toUpload).subscribe((image) => {

          tileDto.imageId = image.id;

          this.tilesService.updateTile(selectedTile.id!, tileDto).subscribe((returnTile: Tile) => {

              if (this.toUpload instanceof Blob) {
                let objectURL = URL.createObjectURL(this.toUpload);
                returnTile.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
              }

              let tileIndex = this.tiles.findIndex((tile) => tile.id == returnTile.id);
              this.tiles[tileIndex] = returnTile;
          });
      });
    } else {
      this.tilesService.updateTile(selectedTile.id!, tileDto).subscribe((returnTile: Tile) => {
        returnTile.image = selectedTile.image;

        if (returnTile.location) {
          let tileIndex = this.locationTiles.findIndex((tile) => tile.id == returnTile.id);
           this.locationTiles[tileIndex] = returnTile;
        } else {
          let tileIndex = this.tiles.findIndex((tile) => tile.id == returnTile.id);
          this.tiles[tileIndex] = returnTile;
        }
      });
    }
    this.toastr.success('Kachel wurde geupdated');
  }, (reason) => {
    this.toastr.warning('Kachel wurde nicht geupdated');
  });
  }

  //--------------------------------------------------------------------------------

  deleteTile(selectedTile: Tile) {
    this.tilesService.deleteTile(selectedTile.id!).subscribe(() => {
      this.tiles = this.tiles.filter((tile) => tile.id != selectedTile.id);
      this.toastr.success('Kachel wurde gelöscht');

    });
  this.modalService.dismissAll();  }
}
