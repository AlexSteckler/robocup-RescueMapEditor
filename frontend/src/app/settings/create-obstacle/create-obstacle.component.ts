import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { Obstacle } from 'src/app/create-edit/obstacle/dto/obstacle.dto';
import { ObstacleService } from 'src/app/create-edit/obstacle/obstacle.service';
import { ImageService } from 'src/app/shared/image.service';

@Component({
  selector: 'app-create-obstacle',
  templateUrl: './create-obstacle.component.html',
  styleUrls: ['./create-obstacle.component.scss']
})

//--------------------------------------------------------------------------------

export class CreateObstacleComponent {
  @ViewChild('basicModal') basicModal: ElementRef | undefined;

  modalHeader: string = 'Neues Hindernis erstellen';

  public toUpload!: File | null;
  obstacleImage: any;

  localObstacles: Obstacle[] = [];

  globaleObstacles: Obstacle[] = [];

  roles: string[] = [];

  selectedObstacle: Obstacle | undefined;

  name: string = '';
  value: number = 0;

//--------------------------------------------------------------------------------

  constructor(
    private toastr : ToastrService,
    private modalService: NgbModal,
    private obstacleService: ObstacleService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer,
    private keycloakService: KeycloakService,
  ) { }

//--------------------------------------------------------------------------------

  ngOnInit(): void {
    this.roles = this.keycloakService.getUserRoles()
    this.obstacleService.getObstacles().subscribe((obstacles: Obstacle[]) => {
      obstacles.forEach((obstacle: Obstacle) => {
        this.imageService.getImg(obstacle.imageId!).subscribe((blob: Blob) => {
          let objectURL = URL.createObjectURL(blob);
          let img = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          obstacle.image = img;

          if (obstacle.location) {
            this.localObstacles.push(obstacle);
          } else {
            this.globaleObstacles.push(obstacle);
          }
        });
      });
    });
  }

//--------------------------------------------------------------------------------

  createObstacle() {
    this.modalHeader = 'Neues Hindernis erstellen';
    this.name = '';
    this.value = 0;
    this.toUpload = null;
    this.obstacleImage = null;
    this.selectedObstacle = undefined;

    this.modalService.open(this.basicModal, { centered: true }).result
    .then((result) => {

      if(this.toUpload) {
        this.imageService.uploadImage(this.toUpload).subscribe((image) => {

          let obstacleImage : any;

          if (this.toUpload instanceof Blob) {
            let objectURL = URL.createObjectURL(this.toUpload);
            obstacleImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            console.log(obstacleImage);
          }

          let obstacleDto : any = {
            name: this.name,
            value: this.value,
            imageId: image.id
          }

          this.obstacleService.createObstacle(obstacleDto).subscribe((resultObstacle: Obstacle) => {
            resultObstacle.image = obstacleImage;
            if (resultObstacle.location) {
              this.localObstacles.unshift(resultObstacle);
            } else {
              this.globaleObstacles.unshift(resultObstacle);
            }
            console.log(resultObstacle);
            this.toastr.success('Das Hindernis wurde erfolgreich erstellt');
          });
        });
      }

      console.log(this.globaleObstacles);
      }, (reason) => {
        this.toastr.info('Der Vorgang wurde abgebrochen');
      }
    );
  }

//--------------------------------------------------------------------------------

  updateObstacle(selectedObstacle: Obstacle) {
    this.modalHeader = 'Hindernis bearbeiten';
    this.selectedObstacle = selectedObstacle;
    this.name = selectedObstacle.name;
    this.value = selectedObstacle.value ? selectedObstacle.value : 0;
    this.obstacleImage = selectedObstacle.image;
    this.modalService.open(this.basicModal, {centered: true}).result.
    then((result) => {
      let obstacleDto : any = {
        name: this.name,
        value: this.value,
        imageId: selectedObstacle.imageId
      }

      if (this.toUpload) {
        this.imageService.uploadImage(this.toUpload).subscribe((image) => {

          obstacleDto.imageId = image.id;

          this.obstacleService.updateObstacle(selectedObstacle.id!, obstacleDto).subscribe((returnObstacle : Obstacle) => {

              if (this.toUpload instanceof Blob) {
                let objectURL = URL.createObjectURL(this.toUpload);
                returnObstacle.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
              }

              let tileIndex = this.globaleObstacles.findIndex((obstacle) => obstacle.id == returnObstacle.id);
              this.globaleObstacles[tileIndex] = returnObstacle;
          });
      });
      } else {
        this.obstacleService.updateObstacle(selectedObstacle.id!, obstacleDto).subscribe((returnObstacle: Obstacle) => {
          returnObstacle.image = selectedObstacle.image;

          if (returnObstacle.location) {
            let tileIndex = this.localObstacles.findIndex((tile) => tile.id == returnObstacle.id);
             this.localObstacles[tileIndex] = returnObstacle;
          } else {
            let tileIndex = this.globaleObstacles.findIndex((tile) => tile.id == returnObstacle.id);
            this.globaleObstacles[tileIndex] = returnObstacle;
          }
          this.toastr.success('Hindernis wurde geupdated');
        });
      }
    }
    , (reason) => {
      this.toastr.info('Hindernis wurde nicht geupdated');
    });
  }

//--------------------------------------------------------------------------------

  deleteObstacle(obstacle: Obstacle) {
    this.obstacleService.deleteObstacle(obstacle.id!).subscribe((result) => {
      if (obstacle.location) {
        this.localObstacles = this.localObstacles.filter((obstacleFilter: Obstacle) => obstacleFilter.id != obstacle.id);
      } else {
        this.globaleObstacles = this.globaleObstacles.filter((obstacleFilter: Obstacle) => obstacleFilter.id != obstacle.id);
      }
      this.toastr.success('Das Hindernis wurde erfolgreich gelöscht');
    });
  }

//--------------------------------------------------------------------------------

  onFileSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files?.item(
      0
    ) as File;
    if (file) {
      this.toUpload = file;

      if (this.name == '') {
        this.name = file.name.lastIndexOf('.') > 0 ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
      }
    }
  }

//--------------------------------------------------------------------------------

  readUrl(event: any) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event:any) => {
          this.obstacleImage = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
