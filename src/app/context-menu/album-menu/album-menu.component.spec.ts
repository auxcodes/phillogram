import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumMenuComponent } from './album-menu.component';

describe('AlbumMenuComponent', () => {
  let component: AlbumMenuComponent;
  let fixture: ComponentFixture<AlbumMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlbumMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
