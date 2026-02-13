import { Routes } from '@angular/router';
import { EncryptionComponent } from './encryption/encryption';
import { DecryptionComponent } from './decryption/decryption';
import { BuyIdComponent } from './buy-id/buy-id';

export const routes: Routes = [
    { path: '', component: EncryptionComponent },
    { path: 'decrypt', component: DecryptionComponent },
    { path: 'buy', component: BuyIdComponent },
];
