/** @format */

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  featuresList: string[];
}

export interface SubscriptionData {
  isSubscribed: boolean;
  lastSubscriptionType: SubscriptionPlan | null;
  lastSubscriptionDate: string;
  subscriptionDateOver: string;
  isAutopayAllowed: boolean;
}

export interface PaymentStatus {
  id: string;
  status: string;
  amount: {
    currency: string;
    value: string;
  };
  createdAt: string; // ISO 8601 formatted date-time string
  confirmation: {
    confirmationUrl: string;
    type: string;
  };
  paid: boolean;
  test: boolean;
  metadata: {
    userProfileId: string;
  };
}
