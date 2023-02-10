import { Component, Input } from '@angular/core';
import { Transform } from 'panzoom';
import { Obstacle } from './dto/obstacle.dto';

@Component({
  selector: 'app-obstacle',
  templateUrl: './obstacle.component.html',
  styleUrls: ['./obstacle.component.scss']
})
export class ObstacleComponent {
  @Input() obstacle: Obstacle | undefined;
  @Input() canvasValues: Transform | undefined;

  rotateObstacle(direction: boolean) {
    if (this.obstacle) {
      if (direction) {
        this.obstacle!.rotation! += 10;
      } else {
        this.obstacle!.rotation! -= 10;
      }
    }
    return false;
  }
}
