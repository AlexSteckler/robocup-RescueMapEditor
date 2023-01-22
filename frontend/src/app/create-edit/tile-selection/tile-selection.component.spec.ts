import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileSelectionComponent } from './tile-selection.component';

describe('TileSelectionComponent', () => {
  let component: TileSelectionComponent;
  let fixture: ComponentFixture<TileSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TileSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TileSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
