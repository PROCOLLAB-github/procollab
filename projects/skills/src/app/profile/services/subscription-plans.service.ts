import { Injectable, inject } from "@angular/core";
import { ApiService } from "@corelib";

@Injectable({
  providedIn: 'root'
})

export class SubscriptionPlansService {
  apiService = inject(ApiService);

  getSubscriptions() {
    return this.apiService.get('/subscription');
  }
}
