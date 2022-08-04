import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTaskWindowComponent } from './new-task-window.component';

describe('NewTaskWindowComponent', () => {
  let component: NewTaskWindowComponent;
  let fixture: ComponentFixture<NewTaskWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewTaskWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTaskWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
