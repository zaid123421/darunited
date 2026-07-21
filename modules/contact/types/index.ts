export interface ContactPhoneNumber {
  id: number;
  phoneNumber: string;
  whatsappUrl: string | null;
  order: number;
}

export interface ContactInfo {
  email: string;
  address: string;
  phoneNumbers: ContactPhoneNumber[];
}

export interface ContactPhoneNumberPayload {
  phoneNumber: string;
  hasWhatsapp: boolean;
  whatsappUrl?: string | null;
}

export interface ContactInfoPayload {
  email: string;
  address: string;
  phoneNumbers: ContactPhoneNumberPayload[];
}

export interface ContactMessagePayload {
  full_name: string;
  email: string;
  title: string;
  script: string;
  service: string;
}

export type ContactInfoMode = "create" | "update";
