import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.css']
})
export class ButtonComponent {
    @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled: boolean = false;
    @Input() loading: boolean = false;

    @Output() btnClick = new EventEmitter<Event>();

    handleClick(event: Event) {
        if (!this.disabled && !this.loading) {
            this.btnClick.emit(event);
        }
    }
}
