import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { ArticleAdminComponent } from './pages/article-admin/article-admin.component';
import { ArticleComponent } from './pages/article/article.component';
import { ArticlesNewsComponent } from './pages/articles-news/articles-news.component';
import { BazarComponent } from './pages/bazar/bazar.component';
import { BookPageComponent } from './pages/book-page/book-page.component';
import { BookcaseComponent } from './pages/bookcase/bookcase.component';
import { CartComponent } from './pages/cart/cart.component';
import { CollectionComponent } from './pages/collection/collection.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MeuBazarComponent } from './pages/meu-bazar/meu-bazar.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { NegotiationDetailComponent } from './pages/negotiation-detail/negotiation-detail.component';
import { NegotiationsComponent } from './pages/negotiations/negotiations.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';
import { TermsComponent } from './pages/terms/terms.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'articles', component: ArticlesNewsComponent },
    { path: 'article/:id', component: ArticleComponent },
    { path: 'bookcase', component: BookcaseComponent, canActivate: [authGuard] },
    { path: 'bazar', component: BazarComponent },
    { path: 'meu-bazar',component:MeuBazarComponent, canActivate:[authGuard]},
    { path: 'collection/:id', component: CollectionComponent, canActivate:[authGuard]},
    { path: 'collection/:collectionId/book/:bookId', component: BookPageComponent},
    { path: 'my-profile', component: MyProfileComponent, canActivate: [authGuard] },
    { path: 'subscription', component: SubscriptionComponent, canActivate:[authGuard]},//assinatura
    { path: 'login', component: LoginComponent, canActivate:[guestGuard]},
    { path: 'signup', component: SignupComponent, canActivate:[guestGuard]},
    { path: 'carrinho', component: CartComponent },
    { path: 'negociacoes', component: NegotiationsComponent, canActivate:[authGuard]},
    { path: 'negociacoes/:id', component: NegotiationDetailComponent, canActivate:[authGuard]},
    { path: 'terms', component: TermsComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'admin/article/new', component: ArticleAdminComponent, canActivate:[adminGuard] },
    { path: 'admin/article/:id/edit', component: ArticleAdminComponent, canActivate:[adminGuard] },

    { path: '**', redirectTo: 'home' }
];
