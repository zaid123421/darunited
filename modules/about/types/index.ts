export interface AboutUsSection {
  id?: number;
  title: string;
  script: string;
}

export interface AboutUsSectionPayload {
  id?: number;
  title: string;
  script: string;
}

export interface AboutUsSyncPayload {
  sections: AboutUsSectionPayload[];
}
