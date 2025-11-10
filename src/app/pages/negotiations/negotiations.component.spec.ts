import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NegotiationsComponent } from './negotiations.component';
import { AuthService } from '../../services/auth.service';
import { NegotiationsService, NegotiationSummary } from '../../services/negotiations.service';

class AuthServiceStub {
  currentUser = { id: 'user-1', name: 'Tester', email: 't@test.com' };
  isAuthenticated() { return true; }
  loadMe() { return of(this.currentUser); }
}

class NegotiationsServiceStub {
  list$ = of([] as NegotiationSummary[]);
  listMine() { return of([] as NegotiationSummary[]); }
}

describe('NegotiationsComponent', () => {
  let component: NegotiationsComponent;
  let fixture: ComponentFixture<NegotiationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegotiationsComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: NegotiationsService, useClass: NegotiationsServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NegotiationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
