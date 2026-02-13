import { Component, Input, Output, EventEmitter, forwardRef, ContentChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() placeholder: string = '';
    @Input() type: string = 'text';
    @Input() actionLabel: string = '';
    @Input() hasIcon: boolean = false;
    @Input() hasRightAction: boolean = false;

    activeType: string = 'text';

    ngOnChanges() {
        this.activeType = this.type;
    }

    togglePasswordVisibility() {
        this.activeType = this.activeType === 'password' ? 'text' : 'password';
    }

    @Output() actionClick = new EventEmitter<void>();

    value: string = '';
    disabled: boolean = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    onInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this.value = val;
        this.onChange(val);
    }

    onAction() {
        this.actionClick.emit();
    }

    writeValue(value: any): void {
        this.value = value || '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
