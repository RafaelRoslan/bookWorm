import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegotiationDetailComponent } from './negotiation-detail.component';

describe('NegotiationDetailComponent', () => {
  let component: NegotiationDetailComponent;
  let fixture: ComponentFixture<NegotiationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegotiationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NegotiationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
