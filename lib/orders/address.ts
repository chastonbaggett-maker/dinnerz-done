export interface DeliveryAddressFields {
  street: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export function formatDeliveryAddress(fields: DeliveryAddressFields): string {
  const streetLine = [fields.street.trim(), fields.line2.trim()].filter(Boolean).join(", ");
  const cityLine = `${fields.city.trim()}, ${fields.state.trim().toUpperCase()} ${fields.zip.trim()}`;
  return [streetLine, cityLine].filter(Boolean).join(", ");
}

export function isDeliveryAddressComplete(fields: DeliveryAddressFields): boolean {
  return Boolean(
    fields.street.trim() &&
      fields.city.trim() &&
      fields.state.trim() &&
      fields.zip.trim()
  );
}
