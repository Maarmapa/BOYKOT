// BSale webhook payload — see github.com/gmontero/Webhooks-Bsale-doc/wiki
export type BsaleWebhookTopic = 'documents' | 'products' | 'variants' | 'stock' | 'prices';
export type BsaleWebhookAction = 'POST' | 'PUT' | 'DELETE';

export interface BsaleWebhookPayload {
  cpnID: number;
  resource: string;       // e.g. "/variants/123.json"
  resourceID: number;
  Topic: BsaleWebhookTopic;
  action: BsaleWebhookAction;
  send: number;           // unix timestamp seconds
  officeId?: number;
}

// Cart item shape stored in carts.items (jsonb).
export interface CartItem {
  variant_id: number;
  product_id: number;
  qty: number;
  unit_price_clp: number;
  name: string;
  image_url?: string;
  color_code?: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  items: CartItem[];
  subtotal_clp: number;
  shipping_clp: number;
  total_clp: number;
  email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  last_activity_at: string;
  abandoned_at: string | null;
  converted_at: string | null;
  created_at: string;
}
