import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
    @Input() file: File | null = null;
    @Input() label: string = 'Select File';
    @Input() subtext: string = '';
    @Input() padding: string = '2.5rem 1.5rem';

    @Output() fileSelected = new EventEmitter<File | null>();

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files.length > 0 ? input.files[0] : null;
        if (file) {
            this.file = file;
            this.fileSelected.emit(file);
        }
    }

    removeFile(event: Event) {
        event.stopPropagation();
        this.file = null;
        if (this.fileInput && this.fileInput.nativeElement) {
            this.fileInput.nativeElement.value = '';
        }
        this.fileSelected.emit(null);
    }
}
