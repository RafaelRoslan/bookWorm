import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellDialogComponent } from './sell-dialog.component';

describe('SellDialogComponent', () => {
  let component: SellDialogComponent;
  let fixture: ComponentFixture<SellDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
