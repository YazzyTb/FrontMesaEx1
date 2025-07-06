import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgDropComponent } from './img-drop.component';

describe('ImgDropComponent', () => {
  let component: ImgDropComponent;
  let fixture: ComponentFixture<ImgDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgDropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
