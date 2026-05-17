/**
 * Font catalog for the dev font switcher.
 *
 * Each slot defines a CSS custom property and the fonts available for it.
 * Add fonts by appending entries to a slot's `fonts` array.
 * Add new slots by appending to the exported SLOTS array.
 *
 * Font entry shape:
 *   id          – unique identifier (used as the stored selection key)
 *   label       – displayed in the UI pill
 *   family      – full CSS font-family stack written to the custom property
 *   googleParams – query string appended to the Google Fonts CSS2 URL,
 *                  or null if the font is already loaded by the page
 */

const primary = [
  {
    id: 'alegreya-sans',
    label: 'Alegreya Sans',
    family: "'Alegreya Sans', system-ui, -apple-system, sans-serif",
    googleParams: null, // loaded by the page <link>
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    family: "'DM Sans', system-ui, -apple-system, sans-serif",
    googleParams: 'family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'inter',
    label: 'Inter',
    family: "'Inter', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Inter:wght@300;400;500',
  },
  {
    id: 'jost',
    label: 'Jost',
    family: "'Jost', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Jost:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'nunito-sans',
    label: 'Nunito Sans',
    family: "'Nunito Sans', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Nunito+Sans:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'outfit',
    label: 'Outfit',
    family: "'Outfit', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Outfit:wght@300;400;500',
  },
  {
    id: 'plus-jakarta-sans',
    label: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'raleway',
    label: 'Raleway',
    family: "'Raleway', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Raleway:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'lato',
    label: 'Lato',
    family: "'Lato', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Lato:ital,wght@0,300;0,400;1,300;1,400',
  },
  {
    id: 'work-sans',
    label: 'Work Sans',
    family: "'Work Sans', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Work+Sans:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'montserrat',
    label: 'Montserrat',
    family: "'Montserrat', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Montserrat:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'karla',
    label: 'Karla',
    family: "'Karla', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Karla:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'manrope',
    label: 'Manrope',
    family: "'Manrope', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Manrope:wght@300;400;500',
  },
  {
    id: 'mulish',
    label: 'Mulish',
    family: "'Mulish', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Mulish:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    family: "'Poppins', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Poppins:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'josefin-sans',
    label: 'Josefin Sans',
    family: "'Josefin Sans', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Josefin+Sans:ital,wght@0,300;0,400;1,300;1,400',
  },
  {
    id: 'urbanist',
    label: 'Urbanist',
    family: "'Urbanist', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Urbanist:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'figtree',
    label: 'Figtree',
    family: "'Figtree', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Figtree:ital,wght@0,300;0,400;0,500;1,300',
  },
  {
    id: 'barlow',
    label: 'Barlow',
    family: "'Barlow', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Barlow:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'cabin',
    label: 'Cabin',
    family: "'Cabin', system-ui, -apple-system, sans-serif",
    googleParams: 'family=Cabin:ital,wght@0,400;0,500;1,400',
  },
];

const display = [
  {
    id: 'eb-garamond',
    label: 'EB Garamond',
    family: "'EB Garamond', Georgia, 'Times New Roman', serif",
    googleParams: null,
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    googleParams: 'family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant',
    family: "'Cormorant Garamond', Georgia, serif",
    googleParams: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    family: "'Merriweather', Georgia, serif",
    googleParams: 'family=Merriweather:ital,wght@0,300;0,400;1,300;1,400',
  },
  {
    id: 'libre-baskerville',
    label: 'Libre Baskerville',
    family: "'Libre Baskerville', Georgia, serif",
    googleParams: 'family=Libre+Baskerville:ital,wght@0,400;1,400',
  },
  {
    id: 'lora',
    label: 'Lora',
    family: "'Lora', Georgia, serif",
    googleParams: 'family=Lora:ital,wght@0,400;0,500;1,400;1,500',
  },
  {
    id: 'spectral',
    label: 'Spectral',
    family: "'Spectral', Georgia, serif",
    googleParams: 'family=Spectral:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500',
  },
  {
    id: 'crimson-pro',
    label: 'Crimson Pro',
    family: "'Crimson Pro', Georgia, serif",
    googleParams: 'family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500',
  },
  {
    id: 'source-serif-4',
    label: 'Source Serif 4',
    family: "'Source Serif 4', Georgia, serif",
    googleParams: 'family=Source+Serif+4:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: "'Fraunces', Georgia, serif",
    googleParams: 'family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'bodoni-moda',
    label: 'Bodoni Moda',
    family: "'Bodoni Moda', Georgia, serif",
    googleParams: 'family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500',
  },
  {
    id: 'cardo',
    label: 'Cardo',
    family: "'Cardo', Georgia, serif",
    googleParams: 'family=Cardo:ital,wght@0,400;1,400',
  },
  {
    id: 'im-fell-english',
    label: 'IM Fell English',
    family: "'IM Fell English', Georgia, serif",
    googleParams: 'family=IM+Fell+English:ital@0;1',
  },
  {
    id: 'bitter',
    label: 'Bitter',
    family: "'Bitter', Georgia, serif",
    googleParams: 'family=Bitter:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'pt-serif',
    label: 'PT Serif',
    family: "'PT Serif', Georgia, serif",
    googleParams: 'family=PT+Serif:ital,wght@0,400;1,400',
  },
  {
    id: 'arvo',
    label: 'Arvo',
    family: "'Arvo', Georgia, serif",
    googleParams: 'family=Arvo:ital,wght@0,400;1,400',
  },
  {
    id: 'zilla-slab',
    label: 'Zilla Slab',
    family: "'Zilla Slab', Georgia, serif",
    googleParams: 'family=Zilla+Slab:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'noto-serif',
    label: 'Noto Serif',
    family: "'Noto Serif', Georgia, serif",
    googleParams: 'family=Noto+Serif:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'old-standard-tt',
    label: 'Old Standard TT',
    family: "'Old Standard TT', Georgia, serif",
    googleParams: 'family=Old+Standard+TT:ital,wght@0,400;1,400',
  },
  {
    id: 'josefin-slab',
    label: 'Josefin Slab',
    family: "'Josefin Slab', Georgia, serif",
    googleParams: 'family=Josefin+Slab:ital,wght@0,300;0,400;1,300;1,400',
  },
];

const tile = [
  {
    id: 'dm-serif-display',
    label: 'DM Serif Display',
    family: "'DM Serif Display', 'EB Garamond', Georgia, serif",
    googleParams: null,
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    googleParams: 'family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant',
    family: "'Cormorant Garamond', Georgia, serif",
    googleParams: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500',
  },
  {
    id: 'abril-fatface',
    label: 'Abril Fatface',
    family: "'Abril Fatface', Georgia, serif",
    googleParams: 'family=Abril+Fatface',
  },
  {
    id: 'libre-bodoni',
    label: 'Libre Bodoni',
    family: "'Libre Bodoni', Georgia, serif",
    googleParams: 'family=Libre+Bodoni:ital,wght@0,400;0,500;1,400',
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: "'Fraunces', Georgia, serif",
    googleParams: 'family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400',
  },
  {
    id: 'instrument-serif',
    label: 'Instrument Serif',
    family: "'Instrument Serif', Georgia, serif",
    googleParams: 'family=Instrument+Serif:ital@0;1',
  },
  {
    id: 'rufina',
    label: 'Rufina',
    family: "'Rufina', Georgia, serif",
    googleParams: 'family=Rufina:wght@400;700',
  },
  {
    id: 'yeseva-one',
    label: 'Yeseva One',
    family: "'Yeseva One', Georgia, serif",
    googleParams: 'family=Yeseva+One',
  },
  {
    id: 'gilda-display',
    label: 'Gilda Display',
    family: "'Gilda Display', Georgia, serif",
    googleParams: 'family=Gilda+Display',
  },
  {
    id: 'cinzel',
    label: 'Cinzel',
    family: "'Cinzel', Georgia, serif",
    googleParams: 'family=Cinzel:wght@400;500',
  },
  {
    id: 'bodoni-moda',
    label: 'Bodoni Moda',
    family: "'Bodoni Moda', Georgia, serif",
    googleParams: 'family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500',
  },
  {
    id: 'antic-didone',
    label: 'Antic Didone',
    family: "'Antic Didone', Georgia, serif",
    googleParams: 'family=Antic+Didone',
  },
  {
    id: 'crete-round',
    label: 'Crete Round',
    family: "'Crete Round', Georgia, serif",
    googleParams: 'family=Crete+Round:ital@0;1',
  },
  {
    id: 'alfa-slab-one',
    label: 'Alfa Slab One',
    family: "'Alfa Slab One', Georgia, serif",
    googleParams: 'family=Alfa+Slab+One',
  },
  {
    id: 'josefin-slab',
    label: 'Josefin Slab',
    family: "'Josefin Slab', Georgia, serif",
    googleParams: 'family=Josefin+Slab:ital,wght@0,300;0,400;1,300;1,400',
  },
  {
    id: 'philosopher',
    label: 'Philosopher',
    family: "'Philosopher', Georgia, serif",
    googleParams: 'family=Philosopher:ital,wght@0,400;1,400',
  },
  {
    id: 'vollkorn',
    label: 'Vollkorn',
    family: "'Vollkorn', Georgia, serif",
    googleParams: 'family=Vollkorn:ital,wght@0,400;0,500;1,400;1,500',
  },
  {
    id: 'syne',
    label: 'Syne',
    family: "'Syne', Georgia, serif",
    googleParams: 'family=Syne:wght@400;500;600',
  },
  {
    id: 'rokkitt',
    label: 'Rokkitt',
    family: "'Rokkitt', Georgia, serif",
    googleParams: 'family=Rokkitt:ital,wght@0,400;0,500;1,400',
  },
];

/**
 * Slot definitions consumed by the font switcher.
 *
 * Each slot:
 *   key       – internal identifier; used as the localStorage field name
 *   label     – section heading shown in the panel
 *   cssVar    – CSS custom property written on :root when a font is applied
 *   defaultId – id of the font active when no selection has been saved
 *   fonts     – ordered list of font entries for this slot
 *
 * To add a new slot, append an object here and make sure the corresponding
 * CSS custom property exists in base.css.
 */
/**
 * Slot definitions consumed by the font switcher.
 *
 * Each slot:
 *   key       – internal identifier; used as the localStorage field name
 *   label     – section heading shown in the panel
 *   cssVar    – CSS custom property written on :root when a font is applied
 *   defaultId – id of the font active when no selection has been saved
 *   fallback  – CSS generic fallback stack appended to custom font names
 *   fonts     – ordered list of font entries for this slot
 *
 * To add a new slot, append an object here and make sure the corresponding
 * CSS custom property exists in base.css.
 */
/**
 * Full Google Fonts catalog for the font switcher autocomplete.
 * Each slot's `fonts` array (above) surfaces as "Suggested" at the top;
 * everything here that isn't in the slot's list appears under "All Google Fonts".
 */
export const GOOGLE_FONTS_ALL = [
  // Sans-serif
  'ABeeZee', 'Abel', 'Albert Sans', 'Alegreya Sans', 'Alegreya Sans SC',
  'Alef', 'Alumni Sans', 'Andika', 'Anuphan',
  'Archivo', 'Archivo Narrow', 'Arimo', 'Armata',
  'Assistant', 'Asap', 'Asap Condensed', 'Atkinson Hyperlegible',
  'Barlow', 'Barlow Condensed', 'Barlow Semi Condensed',
  'BenchNine', 'Big Shoulders Display', 'Big Shoulders Text',
  'Blinker', 'Bricolage Grotesque', 'Cabin', 'Cabin Condensed',
  'Cantarell', 'Catamaran', 'Chakra Petch', 'Changa', 'Chivo',
  'Comfortaa', 'Commissioner', 'Convergence',
  'DM Sans', 'Dosis', 'Epilogue', 'Exo', 'Exo 2',
  'Fira Sans', 'Fira Sans Condensed', 'Figtree', 'Fjalla One',
  'Gantari', 'Geologica', 'Glory', 'Grandstander',
  'Hanken Grotesk', 'Heebo', 'Hind', 'Hind Madurai', 'Hind Siliguri',
  'IBM Plex Sans', 'Inconsolata', 'Inter', 'Inter Tight',
  'Josefin Sans', 'Jost', 'Kanit', 'Karla', 'Khula', 'Kumbh Sans',
  'Lato', 'Lexend', 'Lexend Deca', 'Libre Franklin',
  'M PLUS 1p', 'M PLUS Rounded 1c', 'Manrope',
  'Montserrat', 'Montserrat Alternates', 'Mulish',
  'Nanum Gothic', 'Niramit', 'Noto Sans',
  'Nunito', 'Nunito Sans', 'Open Sans', 'Oswald', 'Outfit', 'Overpass',
  'Oxanium', 'Oxygen', 'Palanquin', 'Poppins', 'Plus Jakarta Sans',
  'Prompt', 'Proza Libre', 'Public Sans', 'Quicksand',
  'Rajdhani', 'Raleway', 'Red Hat Display', 'Red Hat Text',
  'Roboto', 'Roboto Condensed', 'Roboto Flex',
  'Rubik', 'Russo One', 'Saira', 'Saira Condensed', 'Sarabun',
  'Schibsted Grotesk', 'Sen', 'Signika', 'Sora',
  'Source Sans 3', 'Space Grotesk', 'Space Mono', 'Spline Sans',
  'Squada One', 'Syncopate', 'Syne', 'Teko', 'Titillium Web',
  'Ubuntu', 'Unbounded', 'Urbanist', 'Varela Round',
  'Voltaire', 'Work Sans', 'Yantramanav',
  'Ysabeau', 'Ysabeau Office',
  // Serif
  'Abril Fatface', 'Alegreya', 'Alegreya SC', 'Alice', 'Almendra',
  'Andada Pro', 'Antic Didone', 'Arvo', 'Besley', 'Bodoni Moda',
  'Bree Serif', 'Brygada 1918', 'Buenard', 'Cardo',
  'Castoro', 'Cinzel', 'Copse', 'Cormorant', 'Cormorant Garamond',
  'Cormorant Infant', 'Cormorant SC', 'Crete Round',
  'Crimson Pro', 'Crimson Text',
  'DM Serif Display', 'DM Serif Text', 'EB Garamond',
  'Eczar', 'Encode Sans', 'Fauna One', 'Fenix',
  'Forum', 'Frank Ruhl Libre',
  'Gelasio', 'Gilda Display',
  'Headland One', 'IM Fell English', 'IM Fell DW Pica',
  'Instrument Serif', 'Italiana',
  'Josefin Slab', 'Judson', 'Karma', 'Kurale',
  'Libre Baskerville', 'Libre Bodoni', 'Literata', 'Lora',
  'Lusitana', 'Lustria', 'Macondo', 'Marcellus', 'Merriweather',
  'Nanum Myeongjo', 'Newsreader', 'Noticia Text', 'Noto Serif',
  'Old Standard TT', 'Oranienbaum', 'Petrona', 'Philosopher',
  'Playfair Display', 'Playfair Display SC', 'Podkova', 'Prata',
  'PT Serif', 'Quattrocento', 'Rasa', 'Rokkitt', 'Rufina',
  'Source Serif 4', 'Spectral', 'Tinos',
  'Vidaloka', 'Volkhov', 'Vollkorn', 'Vollkorn SC',
  'Yeseva One', 'Zilla Slab',
  // Display / Decorative
  'Bangers', 'Bebas Neue', 'Boogaloo', 'Bungee',
  'Carter One', 'Chewy', 'Cinzel Decorative', 'Concert One',
  'Dancing Script', 'Fredoka One', 'Gravitas One',
  'Kalam', 'Leckerli One', 'Limelight', 'Lobster', 'Lobster Two',
  'Pacifico', 'Passion One', 'Patua One',
  'Permanent Marker', 'Pirata One', 'Poiret One',
  'Righteous', 'Sacramento', 'Sigmar One', 'Special Elite',
  'Titan One', 'Ultra', 'Yellowtail',
  // Monospace
  'Anonymous Pro', 'Courier Prime', 'Fira Code', 'Fragment Mono',
  'IBM Plex Mono', 'JetBrains Mono', 'Major Mono Display',
  'Overpass Mono', 'PT Mono', 'Roboto Mono',
  'Share Tech Mono', 'Source Code Pro', 'Syne Mono', 'Ubuntu Mono',
  'VT323',
];

export const SLOTS = [
  {
    key: 'primary',
    label: 'Primary — UI / body',
    cssVar: '--font-primary',
    defaultId: 'alegreya-sans',
    fallback: 'system-ui, -apple-system, sans-serif',
    fonts: primary,
  },
  {
    key: 'display',
    label: 'Display — headings',
    cssVar: '--font-display',
    defaultId: 'eb-garamond',
    fallback: "Georgia, 'Times New Roman', serif",
    fonts: display,
  },
  {
    key: 'tile',
    label: 'Tile — card titles',
    cssVar: '--font-tile',
    defaultId: 'dm-serif-display',
    fallback: 'Georgia, serif',
    fonts: tile,
  },
];
