import { Routes } from '@angular/router';
import { ArticleComponent } from './pages/article/article.component';
import { BazarComponent } from './pages/bazar/bazar.component';
import { BookcaseComponent } from './pages/bookcase/bookcase.component';
import { ForumComponent } from './pages/forum/forum.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'home', component: HomeComponent},
    { path: 'article', component: ArticleComponent},
    { path: 'bookcase', component: BookcaseComponent},
    { path: 'bazar', component: BazarComponent},
    { path: 'forum', component: ForumComponent},
    { path: 'subscription', component: SubscriptionComponent},
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: '**', redirectTo: 'home' }
];
