import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleAdminComponent } from './article-admin.component';

describe('ArticleAdminComponent', () => {
  let component: ArticleAdminComponent;
  let fixture: ComponentFixture<ArticleAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
