import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorBioComponent } from './author-bio.component';

describe('AuthorBioComponent', () => {
  let component: AuthorBioComponent;
  let fixture: ComponentFixture<AuthorBioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorBioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorBioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
