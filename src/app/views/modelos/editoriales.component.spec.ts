import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorialesComponent } from './editoriales.component';

describe('EditorialesComponent', () => {
  let component: EditorialesComponent;
  let fixture: ComponentFixture<EditorialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
