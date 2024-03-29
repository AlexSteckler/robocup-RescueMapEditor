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
import { Category } from './dto/category.dto';
import { HomeService } from './home.service';
import { ViewportScroller } from '@angular/common';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('basicModal') basicModal: ElementRef | undefined;
  @ViewChild('mapModal') mapModal: ElementRef | undefined;

  authenticated : boolean = false;
  userProfile: KeycloakProfile | null = null;
  userLocation: string = '';

  mapName: string = '';
  selectedDiscipline: string = '';
  selectedCategory: string = '';
  selectedMap: Map | undefined;

  maps: Map[] = [];
  disciplines: string[] = ['Line', 'Line Entry'];
  categories: Category[] = [];

  header: string = '';

  panelOpenState = true;
  editCategoryMode = false;

  categoryName: string = '';
  categoryDiscipline: string[] = [];
  categoryDiscription: string = '';

  roles: string[] = [];

  constructor(
    private gridCanvasService: GridCanvasService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private keycloakService: KeycloakService,
    private imageService: ImageService,
    private homeService: HomeService,
    private sanitizer: DomSanitizer,
    private scroller: ViewportScroller,
  ) {}

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();

    this.roles = this.keycloakService.getUserRoles();

    if (this.authenticated && this.roles.includes('admin') || this.roles.includes('quali') || this.roles.includes('mapper') ) {
      this.userProfile = await this.keycloakService.loadUserProfile();
      if ((this.userProfile as any).attributes && (this.userProfile as any).attributes.location) {
        this.userLocation = (this.userProfile as any).attributes.location;
      }


      this.homeService.getAllCategorys().subscribe((categories) => {
        let first = true;
        categories.forEach((category) => {
          this.categories.push({...category, expanded: first });
          first = false;
        } );

        this.gridCanvasService.getMaps().subscribe((maps) => {
          this.maps = maps;

          maps.forEach((map) => {
            if ( map.imageId != undefined) {
              this.imageService.getImg(map.imageId).subscribe((image) => {
                let objectURL = URL.createObjectURL(image);
                map.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
              })
            }
          })
        });
      });
  }
  }

  createMap(category: Category) {

    if (this.mapName && this.selectedDiscipline) {
      let mapDto = {
        name: this.mapName,
        discipline: this.selectedDiscipline,
        category: category.id,
        isLeftDirection: true,
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

  createCategory() {
    let categoryDto = {
      name: this.categoryName,
      discription: this.categoryDiscription,
      createdBy : this.keycloakService.getUsername(),
    }

    this.homeService.createCategory(categoryDto).subscribe((category) => {
      category.expanded = true;
      this.categories.unshift(category);

      this.toastr.success('Kategorie erstellt');
    });
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

  deleteCategory(category: Category) {
    this.header = 'Diese Kategorie und enthaltende Karten wirklich löschen?';

    this.modalService.open(this.basicModal, { centered: true }).result.then(
      (result) => {
        this.homeService.deleteCategory(category.id).subscribe(() => {
          this.categories = this.categories.filter((c) => c.id !== category.id);
          this.maps.forEach((map) => {
            if (map.category == category.id) {
              this.gridCanvasService.deleteMap(map.id).subscribe(() => {
                this.maps = this.maps.filter((m) => m.id !== map.id);
              });
            }
          });
          this.toastr.success('Kategorie ' + category.name + ' gelöscht');
        });
      },
      (reason) => {
        this.toastr.info('Kategorie nicht gelöscht');
      }
    );
  }

  updateCategory(category: Category) {
    let tmpCategory = {
      name: category.name,
    }
    this.homeService.updateCategory(category.id, tmpCategory).subscribe(() => {
    });
  }

  updateMap(map: Map) {
    this.header = 'Karteninfos bearbeiten';
    this.selectedMap = map;
    let tmpMapName = map.name;
    let tmpCategory = map.category;
    this.selectedCategory = map.category;
    this.modalService.open(this.mapModal, { centered: true }).result.then(
      (result) => {
        let tmpMap = {...map, name: this.selectedMap!.name, category: this.selectedCategory}

        this.gridCanvasService.updateMap(map.id, tmpMap).subscribe(() => {
          map.category = this.selectedCategory;
          this.categories.find((c) => c.id == tmpCategory)!.expanded = false;
          this.categories.find((c) => c.id == this.selectedCategory)!.expanded = true;
          this.maps = Object.assign([], this.maps);
          setTimeout(() => {
            this.scroller.scrollToAnchor(map.id);
          }, 100);
          this.toastr.success('Map geändert');
        });

      } ,
      (reason) => {
        map.name = tmpMapName;
        this.toastr.info('Map ' + map.name + ' nicht geändert');
      }
    );
  }
}
