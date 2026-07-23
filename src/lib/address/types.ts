/**
 * Parsed address fields for Restaurant Filter (city / district).
 * Future country-specific parsers can expand this shape.
 */
export type AddressInfo = {
  city: string | null;
  district: string | null;
};

export const EMPTY_ADDRESS_INFO: AddressInfo = {
  city: null,
  district: null,
};
