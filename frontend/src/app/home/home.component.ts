import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Map } from '../create-edit/dto/map.dto';
import { GridCanvasService } from '../create-edit/grid-canvas/grid-canvas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  maps: Map[] = [];

  mapName: string = '';

  constructor(
    private gridCanvasService: GridCanvasService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.gridCanvasService.getMaps().subscribe((maps) => {
      this.maps = maps;
    });
  }

  createMap() {
    if (this.mapName) {
      this.gridCanvasService.createMap(this.mapName).subscribe((map) => {
        this.maps.push(map);
      });
    } else {
      this.toastr.error('Bitte einen Namen eingeben');
    }
  }

  checkOutMap(map: Map) {
    this.router.navigate(['createEdit', map.id]);
  }
}
