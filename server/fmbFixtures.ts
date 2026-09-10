import {
  FmbDocumentAnalysis,
  FmbIdentification,
  FmbFieldEvidence,
  FmbSketchInterpretation,
  FmbGeometryCalculation,
  FmbFieldStatus,
} from '../src/types';
import {
  calculatePerimeter,
  calculateCadastralLadderArea,
  calculateShoelaceArea,
  runDeterministicMeasurementChecks,
  performCrossDocumentVerification,
} from './fmbEngine';

function createField(
  fieldName: string,
  originalText: string,
  normalizedValue: string | number,
  originalLanguage: 'Tamil' | 'English' | 'Mixed' = 'Tamil',
  status: FmbFieldStatus = 'Extracted',
  pageNumber: number = 1
): FmbFieldEvidence {
  return {
    fieldName,
    category: 'document_id',
    originalText,
    normalizedValue,
    originalLanguage,
    documentId: 'doc_101_04',
    pageNumber,
    extractionProvider: 'Google Gemini Cadastral Vision + Survey OCR Engine',
    timestamp: '2026-03-01T10:00:00Z',
    status,
  };
}

/**
 * Fixture 1: Perur Village Sy 142/3A (Clear Rural FMB with G-line & Ladder Offsets)
 */
export function getSampleFmbPerur142(): FmbDocumentAnalysis {
  const identification: FmbIdentification = {
    documentType: createField('Document Type', 'புலப்பட புத்தகம் (Field Measurement Book)', 'FMB (Field Measurement Book)', 'Tamil'),
    fmbSheetId: createField('Sheet Number', 'Sheet No. 142-3A / Rev 1988', '142-3A-REV-1988', 'English'),
    district: createField('District', 'கோயம்புத்தூர் (Coimbatore)', 'Coimbatore', 'Tamil'),
    taluk: createField('Taluk', 'கோயம்புத்தூர் தெற்கு (Coimbatore South)', 'Coimbatore South', 'Tamil'),
    village: createField('Village', 'பேரூர் (Perur)', 'Perur', 'Tamil'),
    villageCode: createField('Village Code', 'கிராம எண்: 042', '042', 'Tamil'),
    surveyNumber: createField('Survey Number', 'புல எண்: 142', '142', 'Tamil'),
    subdivisionNumber: createField('Subdivision Number', 'உட்பிரிவு: 3A', '3A', 'Tamil'),
    oldSurveyRef: createField('Old Survey Reference', 'பழைய சர்வே: 142 pt (1962 Settlement)', '142 pt', 'Tamil'),
    surveyDate: createField('Survey Date', 'அளவீடு தேதி: 14-08-1988', '1988-08-14', 'Tamil'),
    scale: createField('Scale', 'அளவு திட்டம்: 1 : 2000 (Metric Cadastral)', '1:2000', 'Mixed'),
    measurementUnit: createField('Measurement Units', 'அளவீட்டு அலகு: மீட்டர் (Metres) & லிங்க்ஸ் (Links)', 'Metres', 'Tamil'),
    northOrientation: createField('North Arrow', 'வடக்கு திசை மேல்நோக்கி காட்டப்பட்டுள்ளது (North Arrow pointing Top of Page)', 'North Facing Top (0°)', 'Mixed'),
    adjoiningSheets: createField('Adjoining Sheets', 'இணைப்பு வரைபடங்கள்: தாள் 141 (மேற்கு), 142/2 (வடக்கு), 143 (தெற்கு)', 'Sheet 141, 142/2, 143', 'Tamil'),
    surveyorDesignation: createField('Surveyor Name & Designation', 'கள அளவர்: எஸ். மாணிக்கம் (Field Surveyor, Perur Firka)', 'S. Manickam, Field Surveyor', 'Tamil'),
    sealSignatureStatus: createField('Seal & Signature', 'வட்டாட்சியர் அலுவலக முத்திரை & தலைமை அளவர் கையொப்பம் சரிபார்க்கப்பட்டது', 'Verified State Emblem Seal & Head Surveyor Signature', 'Tamil', 'Officer-confirmed'),
    remarksNotes: createField('Marginal Remarks', 'தெற்கு எல்லையில் வண்டிப்பாதை (Cart Track) பயன்பாடு பதிவு செய்யப்பட்டுள்ளது', 'Southern boundary cart track recorded for public agricultural access', 'Tamil'),
  };

  const measurements = [
    {
      id: 'm_01',
      parcelSubdivision: '142/3A',
      fromPoint: 'A',
      toPoint: 'B',
      rawNotation: '124.5 m',
      parsedNumericValue: 124.5,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_02',
      parcelSubdivision: '142/3A',
      fromPoint: 'B',
      toPoint: 'C',
      rawNotation: '80.0 m',
      parsedNumericValue: 80.0,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_03',
      parcelSubdivision: '142/3A',
      fromPoint: 'C',
      toPoint: 'D',
      rawNotation: '122.8 m',
      parsedNumericValue: 122.8,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_04',
      parcelSubdivision: '142/3A',
      fromPoint: 'D',
      toPoint: 'A',
      rawNotation: '79.2 m',
      parsedNumericValue: 79.2,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_05',
      parcelSubdivision: '142/3A',
      fromPoint: 'A',
      toPoint: 'D',
      rawNotation: 'G-line Baseline: 140.0 m',
      parsedNumericValue: 140.0,
      unit: 'Metres',
      type: 'baseline' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_06',
      parcelSubdivision: '142/3A',
      fromPoint: 'Station 1 (45m)',
      toPoint: 'B',
      rawNotation: 'Offset: 34.2 m',
      parsedNumericValue: 34.2,
      unit: 'Metres',
      type: 'offset' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_07',
      parcelSubdivision: '142/3A',
      fromPoint: 'Station 2 (95m)',
      toPoint: 'C',
      rawNotation: 'Offset: 35.8 m',
      parsedNumericValue: 35.8,
      unit: 'Metres',
      type: 'offset' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
  ];

  const parcels = [
    {
      parcelNumber: '142',
      subdivision: '3A',
      statedAreaRaw: '2.45 ஏResource / ஏக்கர் (2.45 Acres)',
      statedAreaNormalizedSqMeters: 9914.79,
      statedUnit: 'Acres',
      boundaryPointLabels: ['A', 'B', 'C', 'D'],
      adjoiningNorth: 'புல எண் 142/2 (Land of Marappa Gounder)',
      adjoiningSouth: 'வண்டிப்பாதை & புல எண் 143 (Cart Track & Sy 143)',
      adjoiningEast: 'புல எண் 142/3B (Land of Karuppusamy)',
      adjoiningWest: 'புல எண் 141 (Village Panchayat Road)',
      ownerNamesShown: 'M. Shanmugasundaram (Recorded Occupant)',
      classificationShown: 'ரயத்துவாரி புஞ்சை (Ryotwari Punja)',
    },
  ];

  const tracedPoints = [
    { id: 'pt_a', label: 'A', x: 220, y: 720, isStation: true },
    { id: 'pt_b', label: 'B', x: 780, y: 710, isStation: true },
    { id: 'pt_c', label: 'C', x: 760, y: 260, isStation: true },
    { id: 'pt_d', label: 'D', x: 210, y: 270, isStation: true },
  ];

  const tracedLines = [
    { id: 'ln_ab', fromPoint: 'A', toPoint: 'B', type: 'boundary' as const, measurementLabel: '124.5 m', length: 124.5 },
    { id: 'ln_bc', fromPoint: 'B', toPoint: 'C', type: 'boundary' as const, measurementLabel: '80.0 m', length: 80.0 },
    { id: 'ln_cd', fromPoint: 'C', toPoint: 'D', type: 'boundary' as const, measurementLabel: '122.8 m', length: 122.8 },
    { id: 'ln_da', fromPoint: 'D', toPoint: 'A', type: 'boundary' as const, measurementLabel: '79.2 m', length: 79.2 },
    { id: 'ln_base', fromPoint: 'A', toPoint: 'D', type: 'baseline' as const, measurementLabel: 'G-Line: 140.0 m', length: 140.0 },
    { id: 'ln_cart', fromPoint: 'A', toPoint: 'B', type: 'cart_track' as const, measurementLabel: 'வண்டிப்பாதை (Cart Track RoW)' },
  ];

  const sketchInterpretation: FmbSketchInterpretation = {
    plainEnglishExplanation:
      'This Field Measurement Book (FMB) sheet illustrates Survey No. 142, Subdivision 3A in Perur Village, Coimbatore South Taluk. A four-sided rural agricultural parcel with clearly defined boundary lines is drawn in black ink. The northern boundary borders Survey No. 142/2, the eastern line separates Subdivision 3B, the southern edge features an established 12-foot cart track bordering Survey 143, and the western perimeter adjoins the Village Panchayat Road (Survey 141). A central G-line baseline of 140.0 metres with two perpendicular offsets (34.2m and 35.8m) determines the internal triangulation, confirming an area of approximately 2.45 Acres (9,912 sq. metres).',
    plainTamilExplanation:
      'இந்த புலப்பட புத்தகம் (FMB) கோயம்புத்தூர் தெற்கு வட்டம், பேரூர் கிராமத்தின் புல எண் 142, உட்பிரிவு 3A-ன் நில அளவீட்டு வரைபடமாகும். இதில் நான்கு பக்க எல்லைகளுடன் கூடிய விவசாய நிலம் தெளிவாக வரையப்பட்டுள்ளது. வடக்கு எல்லையில் புல எண் 142/2, கிழக்கில் உட்பிரிவு 3B, தெற்கில் புல எண் 143 மற்றும் பொது வண்டிப்பாதை, மேற்கில் கிராம பஞ்சாயத்து சாலை (புல எண் 141) அமைந்துள்ளன. 140.0 மீட்டர் நீளமுள்ள மைய ஜி-லைன் (G-line) அடிப்படையிலும், 34.2 மீ மற்றும் 35.8 மீ அளவுள்ள செங்குத்து ஆஃப்செட்களின் (F-line) அடிப்படையிலும் கணக்கிடப்பட்ட நிலப்பரப்பு சுமார் 2.45 ஏக்கர் (9,912 சதுர மீட்டர்) என துல்லியமாக பொருந்துகிறது.',
    landIdentifiersSummary: 'Perur Village • Sy. 142/3A • Scale 1:2000 • Sheet 142-3A-REV-1988',
    parcelsIdentifiedCount: 1,
    readableMeasurementsCount: 7,
    neighbouringReferences: [
      'North: Survey No. 142/2 (Land of Marappa Gounder)',
      'East: Survey No. 142/3B (Land of Karuppusamy)',
      'South: Public Cart Track and Survey No. 143',
      'West: Survey No. 141 (Village Panchayat Road)',
    ],
    physicalFeaturesLabelled: [
      'Public cart track (வண்டிப்பாதை) running along the entire southern boundary.',
      'Village Panchayat tar road right-of-way bordering the western perimeter.',
      'Field survey stone markers (கள எல்லை கற்கள்) noted at all four vertices A, B, C, D.',
    ],
    sketchCommunicates:
      'Official cadastral demarcation showing closed perimeter geometry with baseline ladder offsets, cart track easement reservation, and four intact boundary stone markers.',
    uncertainDetails: [
      'Cart track width is marked as 12 links (~2.4m) in marginal notes, requiring ground verification by surveyor to ensure non-encroachment by applicant fence.',
    ],
    recommendedFollowUpDocs: [
      'Field inspection with DGPS rover to verify boundary stones A and B alongside the southern cart track.',
      'Subdivision register extract 1988 confirming 142/3 split into 3A and 3B.',
    ],
  };

  const perimeterCalc = calculatePerimeter(measurements);
  const ladderCalc = calculateCadastralLadderArea(measurements);
  const shoelaceCalc = calculateShoelaceArea(tracedPoints, 0.28);

  const statedCalc: FmbGeometryCalculation = {
    id: 'calc_stated_extent',
    target: 'Stated Area',
    inputs: ['Document Field: 2.45 Acres'],
    sourceReferences: ['FMB Header Title Block'],
    methodFormula: 'Stated Area = 2.45 Acres × 4046.86 sq.m/Acre',
    unitsAndConversions: '2.45 Acres = 245 Cents = 9,914.79 sq.metres',
    assumptions: ['Document title value is transcribed accurately from 1988 settlement register.'],
    resultValue: 9914.79,
    resultUnit: 'sq.metres',
    limitations: 'Document text record value. Must be compared against mathematical ladder calculation.',
    status: 'Calculated',
  };

  const { checks, findings } = runDeterministicMeasurementChecks(measurements, parcels, tracedPoints, 9914.79);

  return {
    id: 'fmb_sample_perur_142_3a',
    documentId: 'doc_101_04',
    applicationId: 'app_demo_01',
    fileName: 'FMB_Perur_Village_142_3A.pdf',
    fileSize: 1205944,
    mimeType: 'application/pdf',
    fileUrl: '/assets/sample_docs/fmb_142.pdf',
    checksumSha256: '2a49b8178e23f00a5d12239c89e1b212389ab984',
    pageCount: 1,
    processingStage: 'Completed',
    processingProvider: 'Google Gemini Multimodal (gemini-3.8-flash) + Survey Verification Engine',
    modelName: 'gemini-3.8-flash',
    timestamp: '2026-03-01T10:00:00Z',
    pages: [{ pageNumber: 1, status: 'Success', notes: 'Clear scan, all four boundary sides and ladder readable' }],
    identification,
    parcels,
    measurements,
    sketchInterpretation,
    geometryCalculations: [statedCalc, ladderCalc, perimeterCalc, shoelaceCalc],
    measurementChecks: checks,
    findings,
    humanReviews: [],
    tracedPoints,
    tracedLines,
    isSampleFixture: true,
  };
}

/**
 * Fixture 2: Kuniyamuthur Sy 84/2B (Subdivision FMB with Channel & Shared Edge)
 */
export function getSampleFmbKuniyamuthur84(): FmbDocumentAnalysis {
  const identification: FmbIdentification = {
    documentType: createField('Document Type', 'புலப்பட புத்தகம் (Field Measurement Book)', 'FMB (Field Measurement Book)', 'Tamil'),
    fmbSheetId: createField('Sheet Number', 'Sheet No. 84-2B / 1994', '84-2B-1994', 'English'),
    district: createField('District', 'கோயம்புத்தூர் (Coimbatore)', 'Coimbatore', 'Tamil'),
    taluk: createField('Taluk', 'கோயம்புத்தூர் தெற்கு (Coimbatore South)', 'Coimbatore South', 'Tamil'),
    village: createField('Village', 'குனியமுத்தூர் (Kuniyamuthur)', 'Kuniyamuthur', 'Tamil'),
    villageCode: createField('Village Code', '084', '084', 'English'),
    surveyNumber: createField('Survey Number', '84', '84', 'English'),
    subdivisionNumber: createField('Subdivision Number', '2B', '2B', 'English'),
    oldSurveyRef: createField('Old Survey Reference', '84/2', '84/2', 'English'),
    surveyDate: createField('Survey Date', '1994-06-22', '1994-06-22', 'English'),
    scale: createField('Scale', '1 : 1000 Metric', '1:1000', 'English'),
    measurementUnit: createField('Measurement Units', 'Metres', 'Metres', 'English'),
    northOrientation: createField('North Arrow', 'North (Top of Page)', 'North', 'English'),
    adjoiningSheets: createField('Adjoining Sheets', '84/1, 84/2A, 85', '84/1, 84/2A, 85', 'English'),
    surveyorDesignation: createField('Surveyor Name & Designation', 'K. Murugan, Taluk Surveyor', 'K. Murugan, Taluk Surveyor', 'English'),
    sealSignatureStatus: createField('Seal & Signature', 'Tahsildar Seal Present', 'Tahsildar Seal Present', 'English'),
    remarksNotes: createField('Marginal Remarks', 'Water channel buffer 3m required on North', 'Water channel buffer', 'English'),
  };

  const measurements = [
    {
      id: 'm_k1',
      parcelSubdivision: '84/2B',
      fromPoint: '1',
      toPoint: '2',
      rawNotation: '110.2 m',
      parsedNumericValue: 110.2,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_k2',
      parcelSubdivision: '84/2B',
      fromPoint: '2',
      toPoint: '3',
      rawNotation: '66.0 m',
      parsedNumericValue: 66.0,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_k3',
      parcelSubdivision: '84/2B',
      fromPoint: '3',
      toPoint: '4',
      rawNotation: '112.5 m',
      parsedNumericValue: 112.5,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_k4',
      parcelSubdivision: '84/2B',
      fromPoint: '4',
      toPoint: '1',
      rawNotation: '65.8 m',
      parsedNumericValue: 65.8,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
  ];

  const parcels = [
    {
      parcelNumber: '84',
      subdivision: '2B',
      statedAreaRaw: '1.80 ஏக்கர் (1.80 Acres)',
      statedAreaNormalizedSqMeters: 7284.34,
      statedUnit: 'Acres',
      boundaryPointLabels: ['1', '2', '3', '4'],
      adjoiningNorth: 'புல எண் 84/1 (பாசன வாய்க்கால் / Irrigation Channel)',
      adjoiningSouth: 'புல எண் 85 (தங்கவேலு நிலம்)',
      adjoiningEast: 'புல எண் 84/2A (அரசு புறம்போக்கு வாய்க்கால்)',
      adjoiningWest: 'புல எண் 83 (நெடுஞ்சாலை சாலை)',
      ownerNamesShown: 'V. Jayaprakash',
      classificationShown: 'ரயத்துவாரி நஞ்சை (Ryotwari Nanja)',
    },
  ];

  const tracedPoints = [
    { id: 'pt_k1', label: '1', x: 230, y: 730, isStation: true },
    { id: 'pt_k2', label: '2', x: 770, y: 720, isStation: true },
    { id: 'pt_k3', label: '3', x: 760, y: 290, isStation: true },
    { id: 'pt_k4', label: '4', x: 240, y: 300, isStation: true },
  ];

  const tracedLines = [
    { id: 'ln_k12', fromPoint: '1', toPoint: '2', type: 'boundary' as const, measurementLabel: '110.2 m', length: 110.2 },
    { id: 'ln_k23', fromPoint: '2', toPoint: '3', type: 'boundary' as const, measurementLabel: '66.0 m', length: 66.0 },
    { id: 'ln_k34', fromPoint: '3', toPoint: '4', type: 'boundary' as const, measurementLabel: '112.5 m', length: 112.5 },
    { id: 'ln_k41', fromPoint: '4', toPoint: '1', type: 'boundary' as const, measurementLabel: '65.8 m', length: 65.8 },
    { id: 'ln_kchan', fromPoint: '3', toPoint: '4', type: 'watercourse' as const, measurementLabel: 'பாசன வாய்க்கால் (Channel 3m Buffer)' },
  ];

  const perimeterCalc = calculatePerimeter(measurements);
  const statedCalc: FmbGeometryCalculation = {
    id: 'calc_stated_extent_k',
    target: 'Stated Area',
    inputs: ['Document Field: 1.80 Acres'],
    sourceReferences: ['FMB Header Title Block'],
    methodFormula: 'Stated Area = 1.80 Acres × 4046.86 sq.m/Acre',
    unitsAndConversions: '1.80 Acres = 180 Cents = 7,284.34 sq.metres',
    assumptions: ['Document title value transcribed from Patta 412.'],
    resultValue: 7284.34,
    resultUnit: 'sq.metres',
    limitations: 'Document text record value.',
    status: 'Calculated',
  };

  const { checks, findings } = runDeterministicMeasurementChecks(measurements, parcels, tracedPoints, 7284.34);

  return {
    id: 'fmb_sample_kuniyamuthur_84_2b',
    documentId: 'doc_102_04',
    applicationId: 'app_demo_02',
    fileName: 'FMB_Kuniyamuthur_84_2B.pdf',
    fileSize: 1045210,
    mimeType: 'application/pdf',
    fileUrl: '/assets/sample_docs/fmb_kuniyamuthur.pdf',
    checksumSha256: '8b417c09e32a11b90214dc765a0928f11a8421',
    pageCount: 1,
    processingStage: 'Review required',
    processingProvider: 'Google Gemini Multimodal (gemini-3.8-flash) + Survey Verification Engine',
    modelName: 'gemini-3.8-flash',
    timestamp: '2026-03-01T10:00:00Z',
    pages: [{ pageNumber: 1, status: 'Success', notes: 'Subdivision lines readable; water channel buffer flagged' }],
    identification,
    parcels,
    measurements,
    sketchInterpretation: {
      plainEnglishExplanation:
        'FMB sheet for Survey 84/2B in Kuniyamuthur depicting a rectangular wet agricultural parcel. The northern perimeter adjoins a public irrigation channel requiring a statutory 3-metre buffer zone under Tamil Nadu Irrigation Works Act.',
      plainTamilExplanation:
        'குனியமுத்தூர் கிராம புல எண் 84/2B-ன் வரைபடம். வடக்கு எல்லையில் அரசு பாசன வாய்க்கால் அமைந்துள்ளதால் 3 மீட்டர் பாதுகாப்பு இடைவெளி தேவைப்படுகிறது.',
      landIdentifiersSummary: 'Kuniyamuthur Village • Sy. 84/2B • Scale 1:1000',
      parcelsIdentifiedCount: 1,
      readableMeasurementsCount: 4,
      neighbouringReferences: [
        'North: Survey No. 84/1 (Irrigation Channel)',
        'East: Survey No. 84/2A (Government Poramboke)',
        'South: Survey No. 85',
        'West: Survey No. 83 (Highway)',
      ],
      physicalFeaturesLabelled: ['Government Irrigation Channel (பாசன வாய்க்கால்) on North with 3m buffer'],
      sketchCommunicates: 'Cadastral layout with government watercourse reservation along northern border.',
      uncertainDetails: ['Exact boundary stone alignment along the watercourse channel buffer requires field check.'],
      recommendedFollowUpDocs: ['Joint field survey with PWD Irrigation Assistant Engineer.'],
    },
    geometryCalculations: [statedCalc, perimeterCalc],
    measurementChecks: checks,
    findings,
    humanReviews: [],
    tracedPoints,
    tracedLines,
    isSampleFixture: true,
  };
}

/**
 * Fixture 3: Peelamedu Town Survey Land Record (TSLR Multipage Urban FMB)
 */
export function getSampleFmbPeelameduUrban(): FmbDocumentAnalysis {
  const identification: FmbIdentification = {
    documentType: createField('Document Type', 'நகர நில அளவை வரைபடம் (Town Survey Field Register / TSLR)', 'TSLR Town Survey Sheet', 'Tamil'),
    fmbSheetId: createField('Sheet Number', 'Ward 18 / Block 12 / T.S. 45', 'WARD-18-BLK-12-TS-45', 'English'),
    district: createField('District', 'கோயம்புத்தூர் (Coimbatore)', 'Coimbatore', 'Tamil'),
    taluk: createField('Taluk', 'கோயம்புத்தூர் வடக்கு (Coimbatore North)', 'Coimbatore North', 'Tamil'),
    village: createField('Village / Town', 'பீளமேடு (Peelamedu Town Survey Ward 18)', 'Peelamedu Ward 18', 'Tamil'),
    villageCode: createField('Village Code', 'Ward 18 Block 12', 'W18-B12', 'English'),
    surveyNumber: createField('Town Survey Number', 'T.S. No. 45', '45', 'English'),
    subdivisionNumber: createField('Subdivision Number', '1', '1', 'English'),
    oldSurveyRef: createField('Old Survey Reference', 'Revenue Sy. 219 pt', '219 pt', 'English'),
    surveyDate: createField('Survey Date', '2012-11-15', '2012-11-15', 'English'),
    scale: createField('Scale', '1 : 500 High Precision Urban Metric', '1:500', 'English'),
    measurementUnit: createField('Measurement Units', 'Metres & Decimetres', 'Metres', 'English'),
    northOrientation: createField('North Arrow', 'Grid North 359.8°', 'Grid North', 'English'),
    adjoiningSheets: createField('Adjoining Sheets', 'T.S. 44, T.S. 46, Block 11', 'T.S. 44, 46', 'English'),
    surveyorDesignation: createField('Surveyor Name & Designation', 'P. Senthil Kumar, Head Surveyor (Corporation)', 'P. Senthil Kumar, Head Surveyor', 'English'),
    sealSignatureStatus: createField('Seal & Signature', 'Coimbatore City Municipal Corporation Seal', 'Corporation Seal Verified', 'English', 'Officer-confirmed'),
    remarksNotes: createField('Marginal Remarks', 'DTCP 12m Scheme Road widening reservation on Eastern side', 'Road Widening Reservation', 'English'),
  };

  const measurements = [
    {
      id: 'm_u1',
      parcelSubdivision: 'T.S. 45/1',
      fromPoint: 'S1',
      toPoint: 'S2',
      rawNotation: '42.50 m',
      parsedNumericValue: 42.5,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_u2',
      parcelSubdivision: 'T.S. 45/1',
      fromPoint: 'S2',
      toPoint: 'S3',
      rawNotation: '31.20 m',
      parsedNumericValue: 31.2,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_u3',
      parcelSubdivision: 'T.S. 45/1',
      fromPoint: 'S3',
      toPoint: 'S4',
      rawNotation: '42.40 m',
      parsedNumericValue: 42.4,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_u4',
      parcelSubdivision: 'T.S. 45/1',
      fromPoint: 'S4',
      toPoint: 'S1',
      rawNotation: '31.30 m',
      parsedNumericValue: 31.3,
      unit: 'Metres',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
  ];

  const parcels = [
    {
      parcelNumber: 'T.S. 45',
      subdivision: '1',
      statedAreaRaw: '1326.0 ச.மீட்டர் / 5.95 கிரவுண்ட் (1,326.0 sq.m / 14,272 sq.ft)',
      statedAreaNormalizedSqMeters: 1326.0,
      statedUnit: 'Sq.M',
      boundaryPointLabels: ['S1', 'S2', 'S3', 'S4'],
      adjoiningNorth: 'T.S. 44 (Private Residential Plot)',
      adjoiningSouth: 'T.S. 46 (Commercial Building)',
      adjoiningEast: 'Avinashi Road (12m Scheme Road Widening Strip)',
      adjoiningWest: '9m Municipal Street',
      ownerNamesShown: 'S. Bennitta / Urban Commercial Holdings',
      classificationShown: 'நகர நிலம் - ரயத்துவாரி மனை (Town Survey Urban Residential/Commercial)',
    },
  ];

  const tracedPoints = [
    { id: 'pt_s1', label: 'S1', x: 260, y: 720, isStation: true },
    { id: 'pt_s2', label: 'S2', x: 740, y: 710, isStation: true },
    { id: 'pt_s3', label: 'S3', x: 730, y: 320, isStation: true },
    { id: 'pt_s4', label: 'S4', x: 250, y: 330, isStation: true },
  ];

  const tracedLines = [
    { id: 'ln_s12', fromPoint: 'S1', toPoint: 'S2', type: 'boundary' as const, measurementLabel: '42.50 m', length: 42.5 },
    { id: 'ln_s23', fromPoint: 'S2', toPoint: 'S3', type: 'boundary' as const, measurementLabel: '31.20 m', length: 31.2 },
    { id: 'ln_s34', fromPoint: 'S3', toPoint: 'S4', type: 'boundary' as const, measurementLabel: '42.40 m', length: 42.4 },
    { id: 'ln_s41', fromPoint: 'S4', toPoint: 'S1', type: 'boundary' as const, measurementLabel: '31.30 m', length: 31.3 },
  ];

  const perimeterCalc = calculatePerimeter(measurements);
  const statedCalc: FmbGeometryCalculation = {
    id: 'calc_stated_extent_u',
    target: 'Stated Area',
    inputs: ['Document Field: 1,326.0 sq.m'],
    sourceReferences: ['TSLR Field Register Sheet'],
    methodFormula: 'Stated Area = 1,326.0 sq.metres (5.95 Ground)',
    unitsAndConversions: '1,326.0 sq.m = 14,272 sq.ft = 32.76 Cents',
    assumptions: ['High-precision Corporation ETS (Electronic Total Station) record.'],
    resultValue: 1326.0,
    resultUnit: 'sq.metres',
    limitations: 'Authoritative municipal TSLR register entry.',
    status: 'Calculated',
  };

  const { checks, findings } = runDeterministicMeasurementChecks(measurements, parcels, tracedPoints, 1326.0);

  return {
    id: 'fmb_sample_peelamedu_urban_tslr',
    documentId: 'doc_103_04',
    applicationId: 'app_demo_03',
    fileName: 'TSLR_Peelamedu_Ward18_TS45.pdf',
    fileSize: 1842010,
    mimeType: 'application/pdf',
    fileUrl: '/assets/sample_docs/tslr_peelamedu.pdf',
    checksumSha256: '99418a02c314de871b654e9912048fa29814',
    pageCount: 2,
    processingStage: 'Completed',
    processingProvider: 'Google Gemini Multimodal (gemini-3.8-flash) + Survey Verification Engine',
    modelName: 'gemini-3.8-flash',
    timestamp: '2026-03-01T10:00:00Z',
    pages: [
      { pageNumber: 1, status: 'Success', notes: 'Page 1: Master parcel layout & ETS traverse coordinates' },
      { pageNumber: 2, status: 'Success', notes: 'Page 2: Adjoining road scheme widening schedule' },
    ],
    identification,
    parcels,
    measurements,
    sketchInterpretation: {
      plainEnglishExplanation:
        'Multipage high-precision Town Survey Field Register (TSLR) sheet for Ward 18, Block 12, Town Survey No. 45 in Peelamedu, Coimbatore City Municipal Corporation. The sketch illustrates an urban commercial plot measuring 1,326.0 sq.metres (5.95 Ground) with metric boundary dimensions surveyed via Electronic Total Station. A 12-metre DTCP scheme road widening reservation is marked along the eastern frontage on Avinashi Road.',
      plainTamilExplanation:
        'கோயம்புத்தூர் மாநகராட்சி, பீளமேடு வார்டு 18, பிளாக் 12, நகர நில அளவை எண் 45-ன் டி.எஸ்.எல்.ஆர் (TSLR) வரைபடம். 1,326.0 சதுர மீட்டர் (5.95 கிரவுண்ட்) பரப்பளவு கொண்ட நகர்ப்புற வணிக மனை. அவினாசி சாலையை ஒட்டிய கிழக்கு பகுதியில் 12 மீட்டர் திட்ட சாலை விரிவாக்க இட ஒதுக்கீடு குறிப்பிடப்பட்டுள்ளது.',
      landIdentifiersSummary: 'Peelamedu Ward 18 • Block 12 • T.S. No. 45 • Scale 1:500 Metric',
      parcelsIdentifiedCount: 1,
      readableMeasurementsCount: 4,
      neighbouringReferences: [
        'North: T.S. 44 (Private Residential Plot)',
        'East: Avinashi Road (12m Master Plan Widening Reservation)',
        'South: T.S. 46 (Commercial Complex)',
        'West: 9m Municipal Street',
      ],
      physicalFeaturesLabelled: [
        '12-metre DTCP scheme road widening line shaded along eastern frontage.',
        'Permanent concrete survey benchmark pillar (CCBM 18/12) at Station S1.',
      ],
      sketchCommunicates:
        'Urban cadastral parcel with statutory master plan road alignment and total station coordinates.',
      uncertainDetails: [
        'Road widening reservation of 120 sq.m must be gifted to Corporation via registered deed prior to building planning permission.',
      ],
      recommendedFollowUpDocs: [
        'Town and Country Planning (DTCP) alignment clearance certificate.',
      ],
    },
    geometryCalculations: [statedCalc, perimeterCalc],
    measurementChecks: checks,
    findings,
    humanReviews: [],
    tracedPoints,
    tracedLines,
    isSampleFixture: true,
  };
}

/**
 * Fixture 4: Weathered / Ambiguous FMB (Old Survey 195, Missing Units, Ambiguous Lines)
 */
export function getSampleFmbWeatheredAmbiguous(): FmbDocumentAnalysis {
  const identification: FmbIdentification = {
    documentType: createField('Document Type', 'புலப்பட புத்தகம் (பழைய சர்வே FMB - 1968)', 'FMB (Field Measurement Book)', 'Tamil'),
    fmbSheetId: createField('Sheet Number', 'Old Survey Sheet 195 (Faded Ink)', '195-OLD-1968', 'English', 'Ambiguous'),
    district: createField('District', 'கோயம்புத்தூர் (Coimbatore)', 'Coimbatore', 'Tamil'),
    taluk: createField('Taluk', 'சூலூர் (Sulur)', 'Sulur', 'Tamil'),
    village: createField('Village', 'கலங்கல் (Kalangal)', 'Kalangal', 'Tamil'),
    villageCode: createField('Village Code', 'Unreadable / தேய்ந்த எண்', 'Present but unreadable', 'Tamil', 'Present but unreadable'),
    surveyNumber: createField('Survey Number', 'புல எண்: 195', '195', 'Tamil'),
    subdivisionNumber: createField('Subdivision Number', 'உட்பிரிவு: 2 (அழிந்துள்ளது)', '2', 'Tamil', 'Ambiguous'),
    oldSurveyRef: createField('Old Survey Reference', 'Not shown', 'Not present', 'Tamil', 'Not present'),
    surveyDate: createField('Survey Date', '1968 (?) Faded', '1968-04-10', 'English', 'Ambiguous'),
    scale: createField('Scale', 'அளவு திட்டம் காணப்படவில்லை (No printed scale)', 'Not present', 'Tamil', 'Not present'),
    measurementUnit: createField('Measurement Units', 'அலகு குறிப்பிடப்படவில்லை (Unit not stated - assumed links or chains)', 'Unspecified', 'Tamil', 'Ambiguous'),
    northOrientation: createField('North Arrow', 'வடக்கு திசை அம்பு இல்லை (No North Arrow - Top of Page assumed)', 'Not present', 'Tamil', 'Not present'),
    adjoiningSheets: createField('Adjoining Sheets', 'அருகிலுள்ள புல எண்கள் 194, 196 தெளிவாக இல்லை', 'Sheet 194 pt', 'Tamil', 'Ambiguous'),
    surveyorDesignation: createField('Surveyor Name & Designation', 'கையெழுத்து அழிந்துள்ளது (Illegible Signature)', 'Present but unreadable', 'Tamil', 'Present but unreadable'),
    sealSignatureStatus: createField('Seal & Signature', 'பழைய மை முத்திரை தேய்ந்துள்ளது (Faded Seal)', 'Present but unreadable', 'Tamil', 'Present but unreadable'),
    remarksNotes: createField('Marginal Remarks', 'பழைய சர்வே திருத்தம் - மை கறை உள்ளது (Ink smudge in corner)', 'Ink smudge over southwest corner', 'Tamil'),
  };

  const measurements = [
    {
      id: 'm_w1',
      parcelSubdivision: '195/2',
      fromPoint: 'A',
      toPoint: 'B',
      rawNotation: '185 (?)',
      parsedNumericValue: 185,
      unit: 'Unspecified',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Unclear notation' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_w2',
      parcelSubdivision: '195/2',
      fromPoint: 'B',
      toPoint: 'C',
      rawNotation: '110',
      parsedNumericValue: 110,
      unit: 'Unspecified',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Ambiguous association' as const,
      lineAssociationSupported: false,
      alternativeAssociation: 'Could refer to baseline offset or boundary B-C',
    },
    {
      id: 'm_w3',
      parcelSubdivision: '195/2',
      fromPoint: 'C',
      toPoint: 'D',
      rawNotation: '180 (?)',
      parsedNumericValue: 180,
      unit: 'Unspecified',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Unclear notation' as const,
      lineAssociationSupported: true,
    },
    {
      id: 'm_w4',
      parcelSubdivision: '195/2',
      fromPoint: 'D',
      toPoint: 'A',
      rawNotation: '105',
      parsedNumericValue: 105,
      unit: 'Unspecified',
      type: 'boundary' as const,
      pageNumber: 1,
      interpretationStatus: 'Verified' as const,
      lineAssociationSupported: true,
    },
  ];

  const parcels = [
    {
      parcelNumber: '195',
      subdivision: '2',
      statedAreaRaw: 'தேய்ந்துள்ளது / Unreadable extent',
      statedUnit: 'Unspecified',
      boundaryPointLabels: ['A', 'B', 'C', 'D (?)'],
      adjoiningNorth: 'புல எண் 194 (?)',
      adjoiningSouth: 'புல எண் 196 (?)',
      adjoiningEast: 'பாதை (Unclear Path)',
      adjoiningWest: 'புல எண் 190',
    },
  ];

  const tracedPoints = [
    { id: 'pt_w1', label: 'A', x: 220, y: 700, isStation: true },
    { id: 'pt_w2', label: 'B', x: 740, y: 730, isStation: true },
    { id: 'pt_w3', label: 'C', x: 720, y: 310, isStation: true },
    { id: 'pt_w4', label: 'D (?)', x: 230, y: 280, isStation: true },
  ];

  const tracedLines = [
    { id: 'ln_wab', fromPoint: 'A', toPoint: 'B', type: 'boundary' as const, measurementLabel: '185 (?)' },
    { id: 'ln_wbc', fromPoint: 'B', toPoint: 'C', type: 'boundary' as const, measurementLabel: '110 (Ambiguous)' },
    { id: 'ln_wcd', fromPoint: 'C', toPoint: 'D (?)', type: 'boundary' as const, measurementLabel: '180 (?)' },
    { id: 'ln_wda', fromPoint: 'D (?)', toPoint: 'A', type: 'boundary' as const, measurementLabel: '105' },
  ];

  const perimeterCalc = calculatePerimeter(measurements, 'Unspecified');
  const ladderCalc = calculateCadastralLadderArea(measurements);

  const { checks, findings } = runDeterministicMeasurementChecks(measurements, parcels, tracedPoints);

  // Add specific weathered scan findings
  findings.push({
    id: 'fnd_weathered_units',
    ruleId: 'FMB-UNIT-001',
    category: 'Within FMB',
    severity: 'Major',
    explanation:
      'Measurement units are not specified in the document text. Historical pre-1970 Tamil Nadu survey records commonly used Gunter links, but modern conversion requires reviewing officer confirmation.',
    sourceEvidence: 'FMB Measurements Table',
    recommendedNextAction:
      'Authorized survey officer must confirm measurement unit (Links vs. Metres vs. Feet) in Review & Corrections tab.',
  });

  findings.push({
    id: 'fnd_weathered_station_d',
    ruleId: 'FMB-STAT-002',
    category: 'Within FMB',
    severity: 'Minor',
    explanation: 'Station D marker is partially obscured by ink smudge and faded crease along top-left margin.',
    sourceEvidence: 'Top-left corner margin scan',
    recommendedNextAction: 'Requisition flatbed 300 DPI high-contrast scan from Taluk Record Room.',
  });

  return {
    id: 'fmb_sample_weathered_unreadable',
    documentId: 'doc_104_02',
    applicationId: 'app_demo_04',
    fileName: 'FMB_Kalangal_195_Old_Weathered.pdf',
    fileSize: 841200,
    mimeType: 'application/pdf',
    fileUrl: '/assets/sample_docs/fmb_weathered.pdf',
    checksumSha256: '772184019a2bce123847e09121a88471209b',
    pageCount: 1,
    processingStage: 'Review required',
    processingProvider: 'Google Gemini Multimodal (gemini-3.8-flash) + Survey Verification Engine',
    modelName: 'gemini-3.8-flash',
    timestamp: '2026-03-01T10:00:00Z',
    pages: [{ pageNumber: 1, status: 'Partial', notes: 'Faded ink, missing unit notation, station D ambiguous' }],
    identification,
    parcels,
    measurements,
    sketchInterpretation: {
      plainEnglishExplanation:
        'Weathered cadastral sheet from 1968 for Survey No. 195 in Kalangal Village. The document suffers from ink fading, paper degradation along crease lines, and unreadable village code. Numerical dimensions [185, 110, 180, 105] are readable, but measurement units are omitted from the sheet header. Because this is a pre-metric settlement record, values likely represent Gunter links (1 link = 0.2012m), but statutory verification requires reviewing officer confirmation.',
      plainTamilExplanation:
        'கலங்கல் கிராம புல எண் 195-ன் 1968-ம் ஆண்டு பழைய புலப்பட வரைபடம். மை தேய்மானம் மற்றும் மடிப்பு கறைகள் காரணமாக கிராம எண் மற்றும் அளவீட்டு அலகு குறிப்பிடப்படவில்லை. [185, 110, 180, 105] ஆகிய எண்கள் தெளிவாக உள்ள போதிலும், அலகு லிங்க்ஸா அல்லது மீட்டரா என்பதை ஆய்வு அலுவலர் உறுதி செய்ய வேண்டும்.',
      landIdentifiersSummary: 'Kalangal Village • Sy. 195 • Pre-metric Old Survey Sheet',
      parcelsIdentifiedCount: 1,
      readableMeasurementsCount: 4,
      neighbouringReferences: ['North: Sy 194 (?)', 'South: Sy 196 (?)', 'West: Sy 190'],
      physicalFeaturesLabelled: ['Old pathway / cart track along eastern margin.'],
      sketchCommunicates:
        'Historic cadastral boundary sketch requiring officer review to resolve missing units and verify station markers.',
      uncertainDetails: [
        'Measurement units are missing; must be confirmed by Revenue / Survey Officer.',
        'Station D marker is partially obscured by ink smudge.',
        'No north arrow; orientation must be described as top/bottom/left/right of page.',
      ],
      recommendedFollowUpDocs: [
        'Requisition archive microfilm copy from District Collectorate Survey Archive.',
        'Order field inspection by Firka Surveyor to measure Station A-B on ground.',
      ],
    },
    geometryCalculations: [perimeterCalc, ladderCalc],
    measurementChecks: checks,
    findings,
    humanReviews: [],
    tracedPoints,
    tracedLines,
    isSampleFixture: true,
  };
}

export const SAMPLE_FMB_FIXTURES: Record<string, () => FmbDocumentAnalysis> = {
  'fmb_sample_perur_142_3a': getSampleFmbPerur142,
  'fmb_sample_kuniyamuthur_84_2b': getSampleFmbKuniyamuthur84,
  'fmb_sample_peelamedu_urban_tslr': getSampleFmbPeelameduUrban,
  'fmb_sample_weathered_unreadable': getSampleFmbWeatheredAmbiguous,
};
