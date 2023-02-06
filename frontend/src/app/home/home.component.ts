import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { Map } from '../create-edit/dto/map.dto';
import { GridCanvasService } from '../create-edit/grid-canvas/grid-canvas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('basicModal') basicModal: ElementRef | undefined;

  authenticated : boolean = false;

  maps: Map[] = [];

  mapName: string = '';

  header: string = '';

  panelOpenState = true;

  constructor(
    private gridCanvasService: GridCanvasService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private keycloakService: KeycloakService,
  ) {}

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
    this.gridCanvasService.getMaps().subscribe((maps) => {
      this.maps = maps;
    });
  }

  createMap() {
    if (this.mapName) {
      this.gridCanvasService.createMap(this.mapName).subscribe((map) => {
        this.maps.push(map);
        this.toastr.success('Map erstellt');
        this.router.navigate(['createEdit', map.id])
      });
    } else {
      this.toastr.error('Bitte einen Namen eingeben');
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
}
