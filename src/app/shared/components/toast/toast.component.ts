import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.css']
})
export class ToastComponent {
    @Input() show: boolean = false;
    @Input() message: string = 'Message';
    @Input() type: 'success' | 'error' = 'success';
}
