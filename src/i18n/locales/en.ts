/**
 * English messages — the reference catalogue.
 *
 * Every other language file is typed as `Messages`, so TypeScript reports an
 * error if a translation is missing a key. Words in {curly braces} are
 * placeholders filled in at runtime; keep them unchanged when translating.
 */
const en = {
  'meta.title': 'Dhuni Baba — Vedic birth charts, served with a smile',

  'nav.home': 'Home',
  'nav.begin': 'Birth details',
  'nav.kundli': 'Your Kundli',
  'nav.method': 'Method',
  'nav.privacy': 'Privacy',
  'nav.menu': 'Menu',
  'nav.close': 'Close menu',
  'nav.skip': 'Skip to content',
  'nav.language': 'Language',
  'brand.tagline': 'Celestial gossip, served with ghee',

  'disclaimer.short': 'For fun only — please do not take astrology seriously!!!',
  'disclaimer.full':
    'Dhuni Baba is for entertainment and self-reflection only. Astrology is a traditional belief system, not established science. Nothing here is a factual prediction — do not take astrology seriously!!!',

  'home.eyebrow': 'Vedic astrology · strictly for amusement',
  'home.title': 'Dhuni Baba reads the sky you were born under.',
  'home.lead':
    'Share your birth moment. Baba will consult the planets, stroke his beard thoughtfully, and tell you things about your love life that your relatives were too polite to say.',
  'home.cta': 'Begin your reading',
  'home.ctaSecondary': 'How Baba works',
  'home.stepsTitle': 'How a reading unfolds',
  'home.step1Title': 'Your birth moment',
  'home.step1Body':
    'Name, date, time and place. Unsure of the time? Say so — Baba prefers honesty to guesswork.',
  'home.step2Title': 'The sky, recalculated',
  'home.step2Body':
    'Planet positions are computed with a real astronomical engine, then placed in the sidereal zodiac used in Vedic astrology.',
  'home.step3Title': "Baba's verdict",
  'home.step3Body':
    'Traditional interpretations, delivered with a raised eyebrow and a mostly straight face.',
  'home.heartEyebrow': 'Matters of the heart',
  'home.heartTitle': 'Love, as the old texts tell it',
  'home.heartLead':
    'The classical texts spend a surprising amount of ink on romance. So does Baba.',
  'home.heartVenusTitle': 'Venus and the seventh house',
  'home.heartVenusBody': 'How you love, whom you attract, and why you always text first.',
  'home.heartGunaTitle': 'Guna Milan compatibility',
  'home.heartGunaBody':
    'The traditional 36-point match. Eighteen is a pass; thirty-six is frankly suspicious.',
  'home.heartMangalTitle': 'Mangal Dosha',
  'home.heartMangalBody':
    'Mars in sensitive houses — traditionally feared, frequently exaggerated, gently explained.',
  'home.heartMarriageTitle': 'Marriage timing',
  'home.heartMarriageBody':
    'What the planetary periods traditionally suggest. Your mother will want a copy.',
  'home.quote': 'The stars incline; they do not compel.',
  'home.quoteSource': 'An old saying Baba repeats whenever someone asks for a refund',
  'home.languagesTitle': 'Baba speaks your language',
  'home.languagesBody': 'Eleven languages. One beard.',
  'home.vowTitle': 'A solemn vow',
  'home.vowBody':
    'Dhuni Baba is a work of fun. Astrology is a cultural tradition, not a science, and nothing here predicts facts. Please do not make decisions about love, money, health or marriage based on a website with a cartoon sage.',
  'home.finalTitle': 'The fire is lit. Baba is listening.',
  'home.illustrationLabel': 'Illustration of Dhuni Baba seated before a sacred fire',

  'form.title': 'Your birth moment',
  'form.lead':
    'The more precise your birth time, the more confidently Baba can talk nonsense about your houses.',
  'form.nameLabel': 'Your name',
  'form.nameHint': 'Only used to greet you. Nicknames welcome.',
  'form.dateLabel': 'Date of birth',
  'form.timeLabel': 'Time of birth',
  'form.timeHint': 'Local clock time, as written on your birth certificate.',
  'form.accuracyLabel': 'How sure are you of this time?',
  'form.accuracyExact': 'Exact — from a certificate or hospital record',
  'form.accuracyApprox': 'Approximate — within about 30 minutes',
  'form.accuracyUnknown': "I don't know my birth time",
  'form.unknownNote':
    'No problem. Without a birth time the ascendant (Lagna) and houses cannot be determined, so Baba will read only what the date reveals — and will say so clearly.',
  'form.approxNote':
    'Noted. The ascendant moves about one sign every two hours, so Baba will flag readings that could change within your margin.',
  'form.placeLabel': 'Place of birth',
  'form.placeHint': 'Type a city, town or village, then choose it from the list.',
  'form.placeSearching': 'Consulting the atlas…',
  'form.placeResults': '{count} places found',
  'form.placeNoResults':
    'No places found. Try a nearby larger town, or enter coordinates manually.',
  'form.placeError':
    'The atlas is not responding. Check your connection, or enter coordinates manually.',
  'form.placeSelected': 'Selected birthplace',
  'form.placeChange': 'Change place',
  'form.manualToggle': 'Enter coordinates manually instead',
  'form.manualHide': 'Search for a place instead',
  'form.latLabel': 'Latitude',
  'form.latHint': 'Decimal degrees, north positive (e.g. 13.0827).',
  'form.lonLabel': 'Longitude',
  'form.lonHint': 'Decimal degrees, east positive (e.g. 80.2707).',
  'form.tzLabel': 'Time zone',
  'form.tzHint': 'IANA name, e.g. Asia/Kolkata.',
  'form.submit': 'Reveal my chart',
  'form.reset': 'Clear form',
  'form.privacy':
    'Your details stay in this browser tab. Only the place name you type is sent to the Open-Meteo geocoding service to find coordinates.',
  'form.errorSummary': 'Please check the highlighted fields ({count}).',

  'error.required': 'This field is required.',
  'error.nameTooLong': 'Please keep it under 60 characters.',
  'error.dateInvalid': 'Please enter a valid date.',
  'error.dateFuture': "Baba cannot read a birth that hasn't happened yet.",
  'error.dateTooOld': 'Please choose a date after 1 January 1800.',
  'error.timeInvalid': 'Please enter a valid time (HH:MM).',
  'error.placeRequired': 'Please search for your birthplace and choose it from the list.',
  'error.latInvalid': 'Latitude must be a number between −90 and 90.',
  'error.lonInvalid': 'Longitude must be a number between −180 and 180.',
  'error.tzInvalid': "That time zone isn't recognised. Use a name like Asia/Kolkata.",
  'error.timeGap':
    'This local time never existed — the clocks jumped forward that night. Please double-check it.',

  'kundli.title': 'Your Kundli',
  'kundli.greeting': 'Namaste, {name}.',
  'kundli.emptyTitle': 'No birth details yet',
  'kundli.emptyBody': 'Baba needs your birth moment before he can squint at the sky.',
  'kundli.emptyCta': 'Enter birth details',
  'kundli.detailsTitle': 'Birth details received',
  'kundli.fieldName': 'Name',
  'kundli.fieldDate': 'Date',
  'kundli.fieldTime': 'Local time',
  'kundli.fieldAccuracy': 'Time accuracy',
  'kundli.fieldPlace': 'Place',
  'kundli.fieldCoords': 'Coordinates',
  'kundli.fieldZone': 'Time zone',
  'kundli.fieldUtc': 'Universal time (UTC)',
  'kundli.timeUnknown': 'Unknown',
  'kundli.ambiguous':
    'This local time occurred twice (daylight-saving change). Baba assumed the earlier one.',
  'kundli.calculating': 'Baba is consulting the ephemeris…',
  'kundli.calcError': "Baba's abacus slipped — something went wrong while calculating your chart. Please check your details and try again.",
  'kundli.subtitle': 'Sidereal chart · Lahiri ayanamsha · whole-sign houses',
  'kundli.lagna': 'Lagna (ascendant)',
  'kundli.moonSign': 'Moon sign (Rashi)',
  'kundli.nakshatra': 'Birth star (Nakshatra)',
  'kundli.sunSign': 'Sun sign',
  'kundli.pada': 'pada {pada}',
  'kundli.unknownShort': 'Needs birth time',
  'kundli.chartTitle': 'Rashi chart (D1)',
  'kundli.chartMoonTitle': 'Chandra chart — counted from the Moon',
  'kundli.chartMoonNote': "Without a birth time the true Lagna is unknown, so houses are counted from the Moon's sign (Chandra Lagna), a traditional fallback.",
  'kundli.chartLabel': 'Birth chart. The same positions are listed in the table.',
  'kundli.styleLabel': 'Chart style',
  'kundli.styleNorth': 'North Indian',
  'kundli.styleSouth': 'South Indian',
  'kundli.tableTitle': 'Planetary positions',
  'kundli.colGraha': 'Graha',
  'kundli.colSign': 'Sign',
  'kundli.colDegree': 'Degree',
  'kundli.colNakshatra': 'Nakshatra',
  'kundli.colHouse': 'House',
  'kundli.retrograde': 'retrograde',
  'kundli.dashaTitle': 'Vimshottari dasha',
  'kundli.dashaLead': 'The traditional 120-year cycle of planetary periods, starting from the lord of your birth nakshatra.',
  'kundli.dashaCurrent': 'Running now',
  'kundli.dashaAntar': 'Sub-periods (antardasha) of the {lord} period',
  'kundli.dashaUnknown': "Dashas depend on the Moon's exact position, and the Moon moves about 13° in a day — so without a birth time Baba won't pretend to know them.",
  'kundli.dashaApprox': 'With an approximate birth time, these dates can shift by a few months.',
  'kundli.warnAsc': 'Your Lagna is close to a sign boundary: within ±30 minutes of the time you gave it could fall in a different sign, so house-based readings are uncertain.',
  'kundli.warnMoonSign': 'The Moon changes sign around your birth moment, so your Moon sign (Rashi) is uncertain.',
  'kundli.warnMoonNak': 'The Moon changes nakshatra around your birth moment, so your birth star is uncertain.',
  'kundli.warnPolar': 'Near the poles the ascendant calculation becomes unreliable — treat the Lagna and houses with extra caution.',
  'kundli.noonNote': 'Positions are calculated for local noon. Slow planets barely move in a day, but the Moon can move up to 15°.',
  'kundli.ayanamsha': 'Ayanamsha (Lahiri) used: {value}',
  'kundli.methodLink': 'How these numbers are calculated',
  'kundli.teaser': 'Baba has done the maths. Next, he starts gossiping about it — love, compatibility and all.',
  'kundli.detailsToggle': 'Birth details used',
  'kundli.edit': 'Edit details',
  'kundli.forget': 'Forget my details',

  'method.title': 'Method and conventions',
  'method.lead':
    'Astrology has many schools. These are the conventions Dhuni Baba follows, stated plainly so you know exactly what you are looking at.',
  'method.englishNote': 'Technical details on this page are written in English for precision.',

  'privacy.title': 'Your privacy',
  'privacy.lead': 'Baba reads palms, not inboxes. Here is exactly what happens to your details.',
  'privacy.point1': 'There are no accounts, no database and no analytics on this website.',
  'privacy.point2':
    'Your birth details are kept only in this browser tab (session storage) and vanish when you close it.',
  'privacy.point3':
    'When you search for a birthplace, only the text you type is sent to the Open-Meteo geocoding service.',
  'privacy.point4':
    'Your language choice is remembered on this device so the site opens in your language next time.',
  'privacy.point5':
    'Like any website, the hosting provider may keep short-lived technical logs (such as IP addresses) to serve pages and block abuse.',
  'privacy.forgetNow': 'Forget my birth details now',
  'privacy.forgotten': 'Done. Your birth details have been removed from this tab.',

  'notFound.title': 'Lost in the cosmos',
  'notFound.body': "This page isn't in any constellation Baba knows.",
  'notFound.cta': 'Return home',

  'footer.credits':
    'Place data © GeoNames (CC BY 4.0) via Open-Meteo. Translations are machine-assisted; corrections are welcome.',
} as const

export type MessageKey = keyof typeof en
export type Messages = Record<MessageKey, string>

export default en satisfies Messages
