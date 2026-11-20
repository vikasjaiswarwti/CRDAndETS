// services/pincode.service.ts

export interface PincodeLookupResult {
  city: string | null;
  state: string | null;
}

export const fetchPincodeDetails = async (
  pin: string,
): Promise<PincodeLookupResult | null> => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    const office = data?.[0]?.PostOffice?.[0];

    if (!office) return null;

    return {
      city: office.District ?? null,
      state: office.State ?? null,
    };
  } catch {
    return null;
  }
};
