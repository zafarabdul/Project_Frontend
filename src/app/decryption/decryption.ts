import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-decryption',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decryption.html',
  styleUrl: './decryption.css'
})
export class DecryptionComponent {
  securityId: string = '';
  decryptionKey: string = '';
  encryptedPayload: string = '';

  isDecrypting: boolean = false;
  decryptedOutput: string | null = null;

  initiateDecryption() {
    if (!this.decryptionKey || !this.encryptedPayload) {
      alert("Please provide key and payload");
      return;
    }

    this.isDecrypting = true;

    // Simulate decryption process
    setTimeout(() => {
      try {
        // Mock reversal of our mock encryption: btoa(text + key).split('').reverse().join('')
        // So reverse again -> atob
        const reversed = this.encryptedPayload.split('').reverse().join('');
        const decoded = atob(reversed);

        // remove key from end
        if (decoded.endsWith(this.decryptionKey)) {
          this.decryptedOutput = decoded.slice(0, -this.decryptionKey.length);
        } else {
          // If key doesn't match roughly (for demo) just show decoded
          this.decryptedOutput = decoded;
        }
      } catch (e) {
        this.decryptedOutput = "Error: Invalid Payload or Key";
      }
      this.isDecrypting = false;
    }, 1500);
  }
}
