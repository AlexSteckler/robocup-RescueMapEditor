import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { Map } from '../create-edit/dto/map.dto';
import { GridCanvasService } from '../create-edit/grid-canvas/grid-canvas.service';
import {ImageService} from "../shared/image.service";
import {DomSanitizer} from "@angular/platform-browser";
import {SendFileToUser} from "../shared/sendFileToUser";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('basicModal') basicModal: ElementRef | undefined;

  authenticated : boolean = false;

  mapName: string = '';
  selectedDiscipline: string = '';
  selectedCategorie: string = '';

  maps: Map[] = [];
  disciplines: string[] = ['Line', 'Line Entry'];
  categories: string[] = [];

  header: string = '';

  panelOpenState = true;

  constructor(
    private gridCanvasService: GridCanvasService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private keycloakService: KeycloakService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
    this.gridCanvasService.getMaps().subscribe((maps) => {
      this.maps = maps;
      maps.forEach((map) => {
        if (map.categorie != undefined) {
          if (!this.categories.includes(map.categorie)) {
            this.categories.push(map.categorie);
          }
        }
        if ( map.imageId != undefined) {
          this.imageService.getImg(map.imageId).subscribe((image) => {
            let objectURL = URL.createObjectURL(image);
            map.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          })
        }
      })
    });
  }

  createMap() {
    if (this.mapName && this.selectedDiscipline) {
      let mapDto = {
        name: this.mapName,
        discipline: this.selectedDiscipline,
        categorie: this.selectedCategorie,
      }

      this.gridCanvasService.createMap(mapDto).subscribe((map) => {
        this.maps.push(map);
        this.toastr.success('Map erstellt');
        this.router.navigate(['createEdit', map.id])
      });
    } else {
      if (!this.selectedDiscipline) {
        this.toastr.error('Bitte eine Disziplin auswählen');
      } else {
        this.toastr.error('Bitte einen Namen eingeben');
      }
    }
  }

  deleteMap(map: Map) {

    this.header = 'Diesen Map wirklich löschen?';

    this.modalService.open(this.basicModal, { centered: true }).result.then(
      (result) => {
        this.gridCanvasService.deleteMap(map.id).subscribe(() => {
          this.maps = this.maps.filter((m) => m.id !== map.id);
          this.toastr.success('Map gelöscht');
        });
      },
      (reason) => {
        this.toastr.info('Map nicht gelöscht');
      }
    );
  }

  checkOutMap(map: Map) {
    this.router.navigate(['createEdit', map.id]);
  }

  login() {
    this.keycloakService.login();
  }

  register() {
    this.keycloakService.register();
  }

  async sendMap(map: Map) {
    this.imageService.getImg(map.imageId).subscribe((image) => {
      SendFileToUser.send(image, map.name + '.png');
    })
  }
}
