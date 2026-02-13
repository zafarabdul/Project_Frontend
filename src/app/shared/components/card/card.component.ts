import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css']
})
export class CardComponent implements AfterViewInit {
    hasHeader = true;

    @ViewChild('headerContent', { static: false }) headerContent?: ElementRef;

    ngAfterViewInit() {
        // Logic to check if header content exists could go here, 
        // but CSS selection [header] is simpler for now.
        // However, *ngIf="hasHeader" is tricky with content projection if we don't know if it's empty.
        // For now, we assume if they use the component they might provide a header or not.
        // Actually, simple content projection doesn't let us easily hide the wrapper if empty without checking.
        // Let's rely on the user providing the `header` attribute on the element they want in the header.
    }
}
