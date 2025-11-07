import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeuBazarComponent } from './meu-bazar.component';

describe('MeuBazarComponent', () => {
  let component: MeuBazarComponent;
  let fixture: ComponentFixture<MeuBazarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuBazarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeuBazarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
