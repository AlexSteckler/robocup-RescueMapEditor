import { Component, ElementRef, Sanitizer, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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

  createTile(name: string, value: number, paths: { from: number; to: number; layer: number }[]) {
    if(this.toUpload) {
      this.tilesService.uploadImage(this.toUpload).subscribe((image) => {


        console.log(image);
        let tileImage : any;

        this.tilesService.getTileImg((image as any).id).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          tileImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);

          let tileDto : any = {
            name: name,
            value: value,
            paths: paths,
            imageId: (image as any).id
          }

          console.log(tileDto);

          this.tilesService.createTile(tileDto).subscribe((resultTile: Tile) => {
            this.value = 0;
            this.toUpload = null;
            this.toastr.success('Tile created');

            if (!this.tiles.find((tile) => tile.id == resultTile.id)) {
              resultTile.image = tileImage;
              this.tiles.push(resultTile);
            }

          });
        });
      });
    }
    this.modalService.dismissAll();
  }

  //--------------------------------------------------------------------------------

  updateTile() {

    if(this.toUpload) {
      this.tilesService.uploadImage(this.toUpload).subscribe((image) => {

        console.log(this.selectedTile);
        if (this.selectedTile && this.selectedTile.id) {

        let imageId = (image as any).id

        let tileDto = {
          name: this.name,
          value: this.value,
          paths: this.paths,
          imageId: imageId
        }

        let imgUrl: any;

        this.tilesService.updateTile(this.selectedTile.id, tileDto).subscribe((returnTile: Tile) => {
          this.tilesService.getTileImg(imageId).subscribe((blob: Blob) => {
            let objectURL = URL.createObjectURL(blob);

            returnTile.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            console.log(returnTile.image)

            let tileIndex = this.tiles.findIndex((tile) => tile.id == returnTile.id);
            this.tiles[tileIndex] = returnTile;

          });
        });
      }
    });
  }
  this.modalService.dismissAll();
}


  //--------------------------------------------------------------------------------

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
