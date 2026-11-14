/**
 * Tipos compartidos entre el editor cliente y la capa de
 * servicio. Se mantienen en un archivo sin dependencias de
 * Prisma para que el bundle del navegador no arrastre el
 * cliente de base de datos.
 */

export interface GuideEditorCard {
  name: string;

  slug: string;

  image: string | null;
}

export interface GuideEditorSection {
  heading: string;

  paragraphs: string[];

  bullets: string[];

  cards: GuideEditorCard[];
}

export interface GuideEditorData {
  id: string;

  slug: string;

  title: string;

  summary: string;

  author: string;

  featured: boolean;

  coverUrl: string;

  tags: string[];

  sections: GuideEditorSection[];
}

export interface GuideCoverOption {
  slug: string;

  name: string;

  bannerUrl: string;
}

export interface GuideMutationResult {
  id: string;

  slug: string;
}
