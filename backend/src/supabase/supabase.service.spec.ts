import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'anon-key',
    } as any;
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('listShipments builds URL + headers correctly', async () => {
    const svc = new SupabaseService();
    const fetchSpy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1 }],
      text: async () => '',
    } as any);

    await svc.listShipments('Bearer token123', 10, 30);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];

    expect(String(url)).toMatch(
      /^https:\/\/project\.supabase\.co\/rest\/v1\/Shipment\?/,
    );
    expect(String(url)).toContain('order=id.asc');
    expect(String(url)).toContain('limit=10');
    expect(String(url)).toContain('offset=30');

    const headers = (init as any).headers;
    expect(headers.apikey).toBe('anon-key');
    expect(headers.authorization).toBe('Bearer token123');
    expect(headers['content-type']).toBe('application/json');
  });
});
