export interface Ville {
  id: number;
  nom: string;
  region: string;
  pays: string;
}

export interface Region {
  id: number;
  nom: string;
  pays: string;
  villes: Ville[];
}

export interface Pays {
  id: number;
  nom: string;
  code_iso: string;
  regions: Region[];
}