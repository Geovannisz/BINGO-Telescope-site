/**
 * Barrel file — aggregates all per-page translation dictionaries
 * into a single lookup table keyed by page ID.
 */
import index from './pages/index';
import about from './pages/about';
import science from './pages/science';
import instrumentation from './pages/instrumentation';
import uirapuru from './pages/uirapuru';
import abdus from './pages/abdus';
import outreach from './pages/outreach';
import location from './pages/location';

export const pageTranslations: Record<
  string,
  Record<string, { en: string; zh: string }>
> = {
  index,
  about,
  science,
  instrumentation,
  uirapuru,
  abdus,
  outreach,
  location,
};
