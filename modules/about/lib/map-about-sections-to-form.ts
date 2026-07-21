import type { AboutUsSection } from "@/modules/about/types";
import type { AboutUsFormValues } from "@/modules/about/schemas/about.schema";

export function mapAboutSectionsToForm(sections: AboutUsSection[]): AboutUsFormValues {
  return {
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      script: section.script,
      isNew: false,
    })),
  };
}
