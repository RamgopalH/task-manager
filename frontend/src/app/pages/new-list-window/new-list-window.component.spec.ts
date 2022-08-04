import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewListWindowComponent } from './new-list-window.component';

describe('NewListWindowComponent', () => {
  let component: NewListWindowComponent;
  let fixture: ComponentFixture<NewListWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewListWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewListWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
