import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/select';
import { Input } from './components/input';
import { Label } from './components/label';
import { Switch } from './components/switch';

type PriceKeys =
  | 'p_commercial_low'
  | 'p_commercial_high'
  | 'p_residential_low'
  | 'p_residential_high';

type RegionPricing = {
  title: string;
  p_commercial_low: number;
  p_commercial_high: number;
  p_residential_low: number;
  p_residential_high: number;
};

type PricingJson = Record<string, RegionPricing>;

const PRICE_MATRIX: Record<'commercial' | 'residential', { low: PriceKeys; high: PriceKeys }> = {
  commercial: { low: 'p_commercial_low', high: 'p_commercial_high' },
  residential: { low: 'p_residential_low', high: 'p_residential_high' },
};

export default function App() {
  const [pricing, setPricing] = useState<PricingJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationKey, setLocationKey] = useState<string>(''); // stays empty until user picks
  const [squareMetres, setSquareMetres] = useState<string>('');
  const [isCommercial, setIsCommercial] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load pricing JSON
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/assets/bciPricing.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PricingJson = await res.json();
        if (!mounted) return;
        setPricing(data);
      } catch (e: any) {
        if (mounted) setError(`Failed to load pricing: ${e?.message ?? 'Unknown error'}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // All non-generic regions sorted alphabetically
  const selectableRegions = useMemo(() => {
    if (!pricing) return [];
    return Object.entries(pricing)
      .filter(([key]) => key !== 'generic')
      .sort(([, a], [, b]) => a.title.localeCompare(b.title));
  }, [pricing]);

  // Current region object (recomputes when locationKey changes)
  const regionForDisplay = useMemo<RegionPricing | null>(() => {
    if (!pricing || !locationKey) return null;
    return pricing[locationKey] ?? null;
  }, [pricing, locationKey]);

  // Calculate price range whenever inputs change (region, sqm, type)
  const totalRange = useMemo(() => {
    const sqm = parseFloat(squareMetres);
    if (!regionForDisplay || !Number.isFinite(sqm) || sqm <= 0) return null;

    const type = isCommercial ? 'commercial' : 'residential';
    const { low, high } = PRICE_MATRIX[type];

    return {
      rateLow: regionForDisplay[low],
      rateHigh: regionForDisplay[high],
      totalLow: sqm * regionForDisplay[low],
      totalHigh: sqm * regionForDisplay[high],
    };
  }, [regionForDisplay, squareMetres, isCommercial]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0" style={{ backgroundColor: '#fcfbfd' }}>
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <img
              src="/assets/logo-square-transparent.png"
              alt="Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <CardTitle className="text-2xl">Construction Cost Indicator</CardTitle>
          <p className="text-muted-foreground">Estimate your construction cost range</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Data status */}
          {error && (
            <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">
              {error}
            </div>
          )}

          {/* Location Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={locationKey}
              onValueChange={setLocationKey}
              disabled={loading || !pricing}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder={loading ? 'Loading regions...' : 'Select a region'} />
              </SelectTrigger>
              <SelectContent>
                {selectableRegions.map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    {data.title}
                  </SelectItem>
                ))}
                {/* Generic always last */}
                {pricing?.generic && (
                  <SelectItem value="generic">{pricing.generic.title}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Square Metres Input */}
          <div className="space-y-2">
            <Label htmlFor="square-metres">Square Metres</Label>
            <Input
              id="square-metres"
              type="number"
              placeholder="Enter square metres"
              value={squareMetres}
              onChange={(e) => setSquareMetres(e.target.value)}
              min="0"
              step="1"
              disabled={loading}
            />
          </div>

          {/* Commercial/Residential Toggle */}
          <div className="space-y-2">
            <Label htmlFor="building-type">Building Type</Label>
            <div className="flex items-center justify-center p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center space-x-3">
                <span
                  className={`transition-colors ${
                    !isCommercial ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Residential
                </span>
                <Switch
                  id="building-type"
                  checked={isCommercial}
                  onCheckedChange={setIsCommercial}
                  disabled={loading}
                />
                <span
                  className={`transition-colors ${
                    isCommercial ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Commercial
                </span>
              </div>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="space-y-3 pt-4 border-t">
            {pricing && locationKey && regionForDisplay ? (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Selected region:</span>
                  <span>{regionForDisplay.title}</span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Rate per m²:</span>
                  <span>
                    {formatCurrency(
                      regionForDisplay[
                        PRICE_MATRIX[isCommercial ? 'commercial' : 'residential'].low
                      ]
                    )}{' '}
                    –{' '}
                    {formatCurrency(
                      regionForDisplay[
                        PRICE_MATRIX[isCommercial ? 'commercial' : 'residential'].high
                      ]
                    )}
                  </span>
                </div>

                <div className="m-10" />

                <div className="flex justify-center items-center">
                  <span className="text-lg">Estimated Cost Range:</span>
                </div>
                <div className="text-2xl text-primary text-center -mt-3 font-bold">
                  {totalRange
                    ? `${formatCurrency(totalRange.totalLow)} – ${formatCurrency(
                        totalRange.totalHigh
                      )}`
                    : '—'}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                {loading
                  ? 'Loading pricing...'
                  : 'Select a region and enter details to see cost range'}
              </div>
            )}
          </div>

          {totalRange && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              This is an estimate based on internal research and actual costs may vary based on your
              plan-specifics and finishing requirements.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
