import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SupabaseService {
  private base = process.env.SUPABASE_URL!;
  private anon = process.env.SUPABASE_ANON_KEY!;

  private headers(authHeader?: string) {
    const h: Record<string, string> = {
      apikey: this.anon,
      'content-type': 'application/json',
    };
    if (!authHeader) throw new UnauthorizedException('Missing Authorization');
    h.authorization = authHeader;
    return h;
  }

  async listShipments(auth: string, limit: number, offset: number) {
    const url = new URL(`${this.base}/rest/v1/Shipment`);
    url.searchParams.set(
      'select',
      '*,origin:Location!Shipment_originLocationId_fkey(*),destination:Location!Shipment_destinationLocationId_fkey(*)',
    );
    url.searchParams.set('order', 'id.asc');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    const res = await fetch(url, { headers: this.headers(auth) });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async getShipment(auth: string, id: number) {
    const url = new URL(`${this.base}/rest/v1/Shipment`);
    url.searchParams.set('id', `eq.${id}`);
    url.searchParams.set(
      'select',
      '*,origin:Location!Shipment_originLocationId_fkey(*),destination:Location!Shipment_destinationLocationId_fkey(*)',
    );
    const res = await fetch(url, { headers: this.headers(auth) });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    const arr = await res.json();
    return arr[0] ?? null;
  }

  async createShipment(auth: string, body: any) {
    const res = await fetch(`${this.base}/rest/v1/Shipment`, {
      method: 'POST',
      headers: this.headers(auth),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async updateShipment(auth: string, id: number, body: any) {
    const url = new URL(`${this.base}/rest/v1/Shipment`);
    url.searchParams.set('id', `eq.${id}`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.headers(auth),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async deleteShipment(auth: string, id: number) {
    const url = new URL(`${this.base}/rest/v1/Shipment`);
    url.searchParams.set('id', `eq.${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.headers(auth),
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    return { ok: true };
  }
}
