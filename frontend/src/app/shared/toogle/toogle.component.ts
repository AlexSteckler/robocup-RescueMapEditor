import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-toogle',
  templateUrl: './toogle.component.html',
  styleUrls: ['./toogle.component.scss']
})
export class ToogleComponent implements OnInit {
  @Input() left: string = 'Links';
  @Input() right: string = 'Rechts';
  @Input() isLeftSelected: boolean = false;


  @Output() isLeftSelectedChange = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit(): void {
  }

  changeToggle(isLeft: boolean) {
    this.isLeftSelected = isLeft;
    this.isLeftSelectedChange.emit(isLeft);
  }
}
