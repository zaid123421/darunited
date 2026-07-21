import type { ContactInfo } from "@/modules/contact/types";
import type { ContactInfoValues } from "@/modules/contact/schemas/contact.schema";

export function mapContactInfoToForm(
  contactInfo: ContactInfo | null,
): ContactInfoValues {
  if (!contactInfo) {
    return {
      email: "",
      address: "",
      phoneNumbers: [{ phoneNumber: "", hasWhatsapp: false }],
    };
  }

  return {
    email: contactInfo.email ?? "",
    address: contactInfo.address ?? "",
    phoneNumbers:
      contactInfo.phoneNumbers.length > 0
        ? contactInfo.phoneNumbers.map((phone) => ({
            phoneNumber: phone.phoneNumber,
            hasWhatsapp: Boolean(phone.whatsappUrl),
          }))
        : [{ phoneNumber: "", hasWhatsapp: false }],
  };
}

export function hasContactInfo(contactInfo: ContactInfo | null): boolean {
  if (!contactInfo) {
    return false;
  }

  return Boolean(
    contactInfo.email?.trim() ||
      contactInfo.address?.trim() ||
      contactInfo.phoneNumbers.length > 0,
  );
}
