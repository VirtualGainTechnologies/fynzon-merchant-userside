export interface CryptoAddress {
  message: string;
  error: boolean;
  data: CryptoAddressData;
}

export interface CryptoAddressData {
  network: string;
  address: string;
  qrCode: string;
}