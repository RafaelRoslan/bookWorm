import { CommonModule, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { NegotiationsService } from '../../services/negotiations.service';

@Component({
  selector: 'app-negotiations',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor,
    DecimalPipe, DatePipe,
    RouterLink,          // <== necessário para [routerLink]
    StatusLabelPipe      // <== nosso pipe custom
  ],
  templateUrl: './negotiations.component.html',
  styleUrls: ['./negotiations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationsComponent {
  constructor(public negSvc: NegotiationsService) {}
}