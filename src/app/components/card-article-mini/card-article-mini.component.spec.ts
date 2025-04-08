import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardArticleMiniComponent } from './card-article-mini.component';

describe('CardArticleMiniComponent', () => {
  let component: CardArticleMiniComponent;
  let fixture: ComponentFixture<CardArticleMiniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardArticleMiniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardArticleMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
