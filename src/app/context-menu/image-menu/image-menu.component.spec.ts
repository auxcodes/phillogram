import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageMenuComponent } from './image-menu.component';

describe('ImageMenuComponent', () => {
  let component: ImageMenuComponent;
  let fixture: ComponentFixture<ImageMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
