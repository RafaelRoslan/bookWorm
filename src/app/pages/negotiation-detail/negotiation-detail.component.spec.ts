import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NegotiationDetailComponent } from './negotiation-detail.component';
import { NegotiationsService, NegotiationDetail } from '../../services/negotiations.service';
import { AuthService } from '../../services/auth.service';

const detailMock: NegotiationDetail = {
  id: 'neg-1',
  createdAt: new Date().toISOString(),
  totalPrice: 100,
  evaluated: false,
  status: 'ACTIVE',
  buyer: { id: 'buyer', nome: 'Comprador', cidade: 'Cidade', estado: 'SP', email: 'buyer@test.com' },
  seller: { id: 'seller', nome: 'Vendedor', cidade: 'Cidade', estado: 'SP', email: 'seller@test.com' },
  listings: [],
  items: [],
  logs: [],
  trackingCodes: []
};

class NegotiationsServiceStub {
  getById() { return of(detailMock); }
  accept() { return of(detailMock); }
  markPaid() { return of(detailMock); }
  markShipped() { return of(detailMock); }
}

class AuthServiceStub {
  currentUser = { id: 'seller', name: 'Seller', email: 'seller@test.com' };
  isAuthenticated() { return true; }
  loadMe() { return of(this.currentUser); }
}

describe('NegotiationDetailComponent', () => {
  let component: NegotiationDetailComponent;
  let fixture: ComponentFixture<NegotiationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegotiationDetailComponent, RouterTestingModule],
      providers: [
        { provide: NegotiationsService, useClass: NegotiationsServiceStub },
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NegotiationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
