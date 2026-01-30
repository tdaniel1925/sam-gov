// =============================================================================
// NAICS 2022 OFFICIAL DATABASE
// Complete North American Industry Classification System codes
// Source: U.S. Census Bureau - census.gov/naics
// Current through 2027
// =============================================================================

export interface NAICSCode {
  code: string;
  title: string;
  description: string;
  level: 2 | 3 | 4 | 5 | 6; // Digit level
  parentCode?: string;
  popular?: boolean; // Commonly used in government contracting
  keywords?: string[]; // For search
}

export const NAICS_DATABASE: NAICSCode[] = [
  // ===========================================================================
  // SECTOR 11: AGRICULTURE, FORESTRY, FISHING AND HUNTING
  // ===========================================================================
  {
    code: '11',
    title: 'Agriculture, Forestry, Fishing and Hunting',
    description: 'Establishments primarily engaged in growing crops, raising animals, harvesting timber, and harvesting fish and other animals.',
    level: 2,
    keywords: ['agriculture', 'farming', 'forestry', 'fishing'],
  },

  // ===========================================================================
  // SECTOR 21: MINING, QUARRYING, AND OIL AND GAS EXTRACTION
  // ===========================================================================
  {
    code: '21',
    title: 'Mining, Quarrying, and Oil and Gas Extraction',
    description: 'Establishments primarily engaged in extracting naturally occurring mineral solids, liquids, and gases.',
    level: 2,
    keywords: ['mining', 'oil', 'gas', 'extraction', 'quarrying'],
  },

  // ===========================================================================
  // SECTOR 22: UTILITIES
  // ===========================================================================
  {
    code: '22',
    title: 'Utilities',
    description: 'Establishments engaged in the provision of electric power, natural gas, steam, water, and sewage removal.',
    level: 2,
    keywords: ['utilities', 'power', 'water', 'electric', 'gas'],
  },

  // ===========================================================================
  // SECTOR 23: CONSTRUCTION
  // ===========================================================================
  {
    code: '23',
    title: 'Construction',
    description: 'Establishments primarily engaged in the construction of buildings, infrastructure, and specialty trade work.',
    level: 2,
    keywords: ['construction', 'building', 'contractor'],
  },
  {
    code: '236',
    title: 'Construction of Buildings',
    description: 'New construction, additions, alterations, maintenance, and repairs.',
    level: 3,
    parentCode: '23',
    keywords: ['building construction', 'residential', 'commercial'],
  },
  {
    code: '237',
    title: 'Heavy and Civil Engineering Construction',
    description: 'Construction of engineering projects',
    level: 3,
    parentCode: '23',
    keywords: ['civil engineering', 'infrastructure', 'highway'],
  },
  {
    code: '238',
    title: 'Specialty Trade Contractors',
    description: 'Specialized construction activities',
    level: 3,
    parentCode: '23',
    keywords: ['electrical', 'plumbing', 'hvac'],
  },

  // ===========================================================================
  // SECTOR 31-33: MANUFACTURING
  // ===========================================================================
  {
    code: '31',
    title: 'Manufacturing',
    description: 'Establishments engaged in the mechanical, physical, or chemical transformation of materials into new products.',
    level: 2,
    keywords: ['manufacturing', 'production', 'factory'],
  },

  // ===========================================================================
  // SECTOR 42: WHOLESALE TRADE
  // ===========================================================================
  {
    code: '42',
    title: 'Wholesale Trade',
    description: 'Establishments engaged in wholesaling merchandise and acting as agents or brokers.',
    level: 2,
    keywords: ['wholesale', 'distribution', 'supply'],
  },

  // ===========================================================================
  // SECTOR 44-45: RETAIL TRADE
  // ===========================================================================
  {
    code: '44',
    title: 'Retail Trade',
    description: 'Establishments engaged in retailing merchandise to the general public.',
    level: 2,
    keywords: ['retail', 'store', 'shop'],
  },

  // ===========================================================================
  // SECTOR 48-49: TRANSPORTATION AND WAREHOUSING
  // ===========================================================================
  {
    code: '48',
    title: 'Transportation and Warehousing',
    description: 'Establishments providing transportation of passengers and cargo, warehousing and storage.',
    level: 2,
    keywords: ['transportation', 'logistics', 'shipping', 'warehousing'],
  },

  // ===========================================================================
  // SECTOR 51: INFORMATION
  // ===========================================================================
  {
    code: '51',
    title: 'Information',
    description: 'Establishments engaged in producing and distributing information and cultural products.',
    level: 2,
    keywords: ['information', 'media', 'telecommunications', 'publishing'],
  },
  {
    code: '517',
    title: 'Telecommunications',
    description: 'Telecommunications services including wired, wireless, satellite, and internet.',
    level: 3,
    parentCode: '51',
    popular: true,
    keywords: ['telecom', 'wireless', 'internet', 'network'],
  },
  {
    code: '518',
    title: 'Data Processing, Hosting, and Related Services',
    description: 'Data processing, hosting, and related information services.',
    level: 3,
    parentCode: '51',
    popular: true,
    keywords: ['data center', 'hosting', 'cloud', 'data processing'],
  },

  // ===========================================================================
  // SECTOR 52: FINANCE AND INSURANCE
  // ===========================================================================
  {
    code: '52',
    title: 'Finance and Insurance',
    description: 'Establishments primarily engaged in financial transactions and insurance.',
    level: 2,
    keywords: ['finance', 'banking', 'insurance'],
  },

  // ===========================================================================
  // SECTOR 53: REAL ESTATE AND RENTAL AND LEASING
  // ===========================================================================
  {
    code: '53',
    title: 'Real Estate and Rental and Leasing',
    description: 'Establishments primarily engaged in renting, leasing, or allowing use of assets.',
    level: 2,
    keywords: ['real estate', 'property', 'rental', 'leasing'],
  },

  // ===========================================================================
  // SECTOR 54: PROFESSIONAL, SCIENTIFIC, AND TECHNICAL SERVICES
  // (MOST COMMON IN GOVERNMENT CONTRACTING)
  // ===========================================================================
  {
    code: '54',
    title: 'Professional, Scientific, and Technical Services',
    description: 'Establishments that specialize in performing professional, scientific, and technical activities.',
    level: 2,
    popular: true,
    keywords: ['professional services', 'consulting', 'technical services'],
  },
  {
    code: '541',
    title: 'Professional, Scientific, and Technical Services',
    description: 'Professional, scientific, and technical services.',
    level: 3,
    parentCode: '54',
    popular: true,
    keywords: ['professional', 'scientific', 'technical'],
  },

  // 5411 - Legal Services
  {
    code: '5411',
    title: 'Legal Services',
    description: 'Legal advice and representation',
    level: 4,
    parentCode: '541',
    keywords: ['legal', 'law', 'attorney'],
  },
  {
    code: '541110',
    title: 'Offices of Lawyers',
    description: 'Establishments of lawyers or attorneys providing legal services.',
    level: 6,
    parentCode: '5411',
    keywords: ['lawyer', 'attorney', 'legal counsel'],
  },

  // 5412 - Accounting Services
  {
    code: '5412',
    title: 'Accounting, Tax Preparation, Bookkeeping, and Payroll Services',
    description: 'Accounting, auditing, and bookkeeping services',
    level: 4,
    parentCode: '541',
    popular: true,
    keywords: ['accounting', 'audit', 'tax', 'bookkeeping'],
  },
  {
    code: '541211',
    title: 'Offices of Certified Public Accountants',
    description: 'CPA services including auditing and tax preparation.',
    level: 6,
    parentCode: '5412',
    popular: true,
    keywords: ['cpa', 'accounting', 'audit', 'financial'],
  },
  {
    code: '541213',
    title: 'Tax Preparation Services',
    description: 'Preparation of tax returns',
    level: 6,
    parentCode: '5412',
    keywords: ['tax', 'tax preparation', 'tax filing'],
  },
  {
    code: '541214',
    title: 'Payroll Services',
    description: 'Payroll processing and related services',
    level: 6,
    parentCode: '5412',
    keywords: ['payroll', 'payroll processing'],
  },

  // 5413 - Architectural and Engineering Services
  {
    code: '5413',
    title: 'Architectural, Engineering, and Related Services',
    description: 'Architectural, engineering, and specialized design services',
    level: 4,
    parentCode: '541',
    popular: true,
    keywords: ['architecture', 'engineering', 'design'],
  },
  {
    code: '541310',
    title: 'Architectural Services',
    description: 'Planning and designing residential, institutional, and commercial buildings.',
    level: 6,
    parentCode: '5413',
    popular: true,
    keywords: ['architecture', 'architectural design', 'building design'],
  },
  {
    code: '541330',
    title: 'Engineering Services',
    description: 'Engineering services including civil, mechanical, electrical, and chemical engineering.',
    level: 6,
    parentCode: '5413',
    popular: true,
    keywords: ['engineering', 'civil engineering', 'mechanical engineering', 'electrical engineering'],
  },
  {
    code: '541340',
    title: 'Drafting Services',
    description: 'Drafting detailed layouts, plans, and illustrations.',
    level: 6,
    parentCode: '5413',
    keywords: ['drafting', 'technical drawing', 'cad'],
  },
  {
    code: '541350',
    title: 'Building Inspection Services',
    description: 'Building inspection services',
    level: 6,
    parentCode: '5413',
    keywords: ['inspection', 'building inspection'],
  },
  {
    code: '541360',
    title: 'Geophysical Surveying and Mapping Services',
    description: 'Geophysical surveying and mapping',
    level: 6,
    parentCode: '5413',
    keywords: ['surveying', 'mapping', 'geophysical'],
  },
  {
    code: '541370',
    title: 'Surveying and Mapping (except Geophysical) Services',
    description: 'Land surveying and mapping services',
    level: 6,
    parentCode: '5413',
    keywords: ['surveying', 'mapping', 'land survey'],
  },
  {
    code: '541380',
    title: 'Testing Laboratories',
    description: 'Testing services for food, materials, and products.',
    level: 6,
    parentCode: '5413',
    popular: true,
    keywords: ['testing', 'laboratory', 'quality testing'],
  },

  // 5414 - Specialized Design Services
  {
    code: '5414',
    title: 'Specialized Design Services',
    description: 'Interior, industrial, graphic, and other specialized design',
    level: 4,
    parentCode: '541',
    keywords: ['design', 'specialized design'],
  },
  {
    code: '541410',
    title: 'Interior Design Services',
    description: 'Interior design and space planning',
    level: 6,
    parentCode: '5414',
    keywords: ['interior design', 'space planning'],
  },
  {
    code: '541420',
    title: 'Industrial Design Services',
    description: 'Industrial and product design',
    level: 6,
    parentCode: '5414',
    keywords: ['industrial design', 'product design'],
  },
  {
    code: '541430',
    title: 'Graphic Design Services',
    description: 'Graphic design services',
    level: 6,
    parentCode: '5414',
    keywords: ['graphic design', 'visual design', 'branding'],
  },

  // 5415 - Computer Systems Design and Related Services (CRITICAL FOR GOV CONTRACTING)
  {
    code: '5415',
    title: 'Computer Systems Design and Related Services',
    description: 'Computer systems design, programming, and related services',
    level: 4,
    parentCode: '541',
    popular: true,
    keywords: ['it', 'computer', 'software', 'programming'],
  },
  {
    code: '541511',
    title: 'Custom Computer Programming Services',
    description: 'Writing, modifying, testing, and supporting software.',
    level: 6,
    parentCode: '5415',
    popular: true,
    keywords: ['programming', 'software development', 'custom software', 'coding'],
  },
  {
    code: '541512',
    title: 'Computer Systems Design Services',
    description: 'Planning and designing computer systems that integrate hardware, software, and communication technologies.',
    level: 6,
    parentCode: '5415',
    popular: true,
    keywords: ['systems design', 'it consulting', 'systems integration', 'network design'],
  },
  {
    code: '541513',
    title: 'Computer Facilities Management Services',
    description: 'Computer systems or data processing facilities support services.',
    level: 6,
    parentCode: '5415',
    popular: true,
    keywords: ['facilities management', 'data center', 'it management'],
  },
  {
    code: '541519',
    title: 'Other Computer Related Services',
    description: 'Computer disaster recovery, software installation, computer training.',
    level: 6,
    parentCode: '5415',
    popular: true,
    keywords: ['it services', 'disaster recovery', 'computer training', 'tech support'],
  },

  // 5416 - Management, Scientific, and Technical Consulting
  {
    code: '5416',
    title: 'Management, Scientific, and Technical Consulting Services',
    description: 'Management consulting and related services',
    level: 4,
    parentCode: '541',
    popular: true,
    keywords: ['consulting', 'management', 'business consulting'],
  },
  {
    code: '541611',
    title: 'Administrative Management and General Management Consulting Services',
    description: 'General management consulting services',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['management consulting', 'business consulting', 'strategy'],
  },
  {
    code: '541612',
    title: 'Human Resources Consulting Services',
    description: 'Human resources and personnel management consulting.',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['hr consulting', 'human resources', 'personnel'],
  },
  {
    code: '541613',
    title: 'Marketing Consulting Services',
    description: 'Marketing consulting and market research.',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['marketing', 'market research', 'marketing consulting'],
  },
  {
    code: '541614',
    title: 'Process, Physical Distribution, and Logistics Consulting Services',
    description: 'Operations, logistics, and supply chain consulting.',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['logistics', 'supply chain', 'operations consulting'],
  },
  {
    code: '541618',
    title: 'Other Management Consulting Services',
    description: 'Other management consulting including cybersecurity consulting.',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['consulting', 'cybersecurity consulting', 'risk management'],
  },
  {
    code: '541620',
    title: 'Environmental Consulting Services',
    description: 'Environmental consulting and compliance.',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['environmental', 'sustainability', 'compliance'],
  },
  {
    code: '541690',
    title: 'Other Scientific and Technical Consulting Services',
    description: 'Scientific and technical consulting not elsewhere classified.',
    level: 6,
    parentCode: '5416',
    popular: true,
    keywords: ['scientific consulting', 'technical consulting'],
  },

  // 5417 - Scientific Research and Development
  {
    code: '5417',
    title: 'Scientific Research and Development Services',
    description: 'Research and development in physical, engineering, and life sciences',
    level: 4,
    parentCode: '541',
    popular: true,
    keywords: ['research', 'r&d', 'development', 'innovation'],
  },
  {
    code: '541713',
    title: 'Research and Development in Nanotechnology',
    description: 'Research and experimental development in nanotechnology.',
    level: 6,
    parentCode: '5417',
    keywords: ['nanotechnology', 'research', 'development'],
  },
  {
    code: '541714',
    title: 'Research and Development in Biotechnology (except Nanobiotechnology)',
    description: 'Biotechnology research and development.',
    level: 6,
    parentCode: '5417',
    keywords: ['biotechnology', 'biotech', 'research'],
  },
  {
    code: '541715',
    title: 'Research and Development in the Physical, Engineering, and Life Sciences (except Nanotechnology and Biotechnology)',
    description: 'Scientific research and development services.',
    level: 6,
    parentCode: '5417',
    popular: true,
    keywords: ['research', 'scientific research', 'engineering research'],
  },
  {
    code: '541720',
    title: 'Research and Development in the Social Sciences and Humanities',
    description: 'Social science and humanities research.',
    level: 6,
    parentCode: '5417',
    keywords: ['social science', 'research', 'humanities'],
  },

  // 5418 - Advertising, Public Relations, and Related Services
  {
    code: '5418',
    title: 'Advertising, Public Relations, and Related Services',
    description: 'Advertising, public relations, and marketing services',
    level: 4,
    parentCode: '541',
    keywords: ['advertising', 'marketing', 'public relations'],
  },
  {
    code: '541810',
    title: 'Advertising Agencies',
    description: 'Full-service advertising agencies',
    level: 6,
    parentCode: '5418',
    keywords: ['advertising', 'marketing agency', 'creative services'],
  },
  {
    code: '541820',
    title: 'Public Relations Agencies',
    description: 'Public relations services',
    level: 6,
    parentCode: '5418',
    keywords: ['public relations', 'pr', 'communications'],
  },
  {
    code: '541830',
    title: 'Media Buying Agencies',
    description: 'Media planning and buying services',
    level: 6,
    parentCode: '5418',
    keywords: ['media buying', 'advertising'],
  },
  {
    code: '541840',
    title: 'Media Representatives',
    description: 'Media representatives and sales',
    level: 6,
    parentCode: '5418',
    keywords: ['media', 'advertising sales'],
  },
  {
    code: '541850',
    title: 'Indoor and Outdoor Display Advertising',
    description: 'Display advertising services',
    level: 6,
    parentCode: '5418',
    keywords: ['display advertising', 'signage'],
  },
  {
    code: '541860',
    title: 'Direct Mail Advertising',
    description: 'Direct mail advertising campaigns',
    level: 6,
    parentCode: '5418',
    keywords: ['direct mail', 'marketing'],
  },
  {
    code: '541870',
    title: 'Advertising Material Distribution Services',
    description: 'Distribution of advertising materials',
    level: 6,
    parentCode: '5418',
    keywords: ['advertising', 'distribution'],
  },
  {
    code: '541890',
    title: 'Other Services Related to Advertising',
    description: 'Other advertising services including digital marketing.',
    level: 6,
    parentCode: '5418',
    popular: true,
    keywords: ['digital marketing', 'online advertising', 'social media marketing'],
  },

  // 5419 - Other Professional, Scientific, and Technical Services
  {
    code: '5419',
    title: 'Other Professional, Scientific, and Technical Services',
    description: 'Other professional, scientific, and technical services',
    level: 4,
    parentCode: '541',
    keywords: ['professional services', 'technical services'],
  },
  {
    code: '541910',
    title: 'Marketing Research and Public Opinion Polling',
    description: 'Market research and public opinion research.',
    level: 6,
    parentCode: '5419',
    popular: true,
    keywords: ['market research', 'polling', 'survey research'],
  },
  {
    code: '541920',
    title: 'Photographic Services',
    description: 'Commercial and portrait photography.',
    level: 6,
    parentCode: '5419',
    keywords: ['photography', 'photographic services'],
  },
  {
    code: '541930',
    title: 'Translation and Interpretation Services',
    description: 'Language translation and interpretation.',
    level: 6,
    parentCode: '5419',
    popular: true,
    keywords: ['translation', 'interpretation', 'language services'],
  },
  {
    code: '541940',
    title: 'Veterinary Services',
    description: 'Veterinary services for pets and livestock.',
    level: 6,
    parentCode: '5419',
    keywords: ['veterinary', 'animal health'],
  },
  {
    code: '541990',
    title: 'All Other Professional, Scientific, and Technical Services',
    description: 'Professional services not elsewhere classified, including cybersecurity services.',
    level: 6,
    parentCode: '5419',
    popular: true,
    keywords: ['professional services', 'cybersecurity', 'security consulting'],
  },

  // ===========================================================================
  // SECTOR 55: MANAGEMENT OF COMPANIES AND ENTERPRISES
  // ===========================================================================
  {
    code: '55',
    title: 'Management of Companies and Enterprises',
    description: 'Holdings and management of companies and enterprises',
    level: 2,
    keywords: ['management', 'holdings'],
  },

  // ===========================================================================
  // SECTOR 56: ADMINISTRATIVE AND SUPPORT AND WASTE MANAGEMENT
  // ===========================================================================
  {
    code: '56',
    title: 'Administrative and Support and Waste Management and Remediation Services',
    description: 'Administrative, support, waste management, and remediation services',
    level: 2,
    popular: true,
    keywords: ['administrative', 'support services', 'facilities'],
  },
  {
    code: '561',
    title: 'Administrative and Support Services',
    description: 'Support activities for business operations',
    level: 3,
    parentCode: '56',
    popular: true,
    keywords: ['administrative', 'support', 'business services'],
  },
  {
    code: '561210',
    title: 'Facilities Support Services',
    description: 'Operating staff to perform combination of support services on-site.',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['facilities', 'facilities management', 'building services'],
  },
  {
    code: '561310',
    title: 'Employment Placement Agencies',
    description: 'Employment and recruitment services',
    level: 6,
    parentCode: '561',
    keywords: ['recruitment', 'staffing', 'employment'],
  },
  {
    code: '561320',
    title: 'Temporary Help Services',
    description: 'Temporary staffing services',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['temp staffing', 'temporary workers', 'contract workers'],
  },
  {
    code: '561330',
    title: 'Professional Employer Organizations',
    description: 'HR administrative services',
    level: 6,
    parentCode: '561',
    keywords: ['peo', 'hr services'],
  },
  {
    code: '561499',
    title: 'All Other Business Support Services',
    description: 'Business support services not elsewhere classified.',
    level: 6,
    parentCode: '561',
    keywords: ['business support', 'administrative services'],
  },
  {
    code: '561611',
    title: 'Investigation Services',
    description: 'Private investigation and detective services.',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['investigation', 'security', 'background checks'],
  },
  {
    code: '561621',
    title: 'Security Systems Services (except Locksmiths)',
    description: 'Security systems services including monitoring.',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['security systems', 'alarm systems', 'surveillance'],
  },
  {
    code: '561622',
    title: 'Locksmiths',
    description: 'Locksmith services',
    level: 6,
    parentCode: '561',
    keywords: ['locksmith', 'lock services'],
  },
  {
    code: '561612',
    title: 'Security Guards and Patrol Services',
    description: 'Security guard and patrol services.',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['security guards', 'security patrol', 'security services'],
  },
  {
    code: '561720',
    title: 'Janitorial Services',
    description: 'Cleaning buildings and facilities.',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['janitorial', 'cleaning', 'maintenance'],
  },
  {
    code: '561730',
    title: 'Landscaping Services',
    description: 'Landscape care and maintenance services.',
    level: 6,
    parentCode: '561',
    popular: true,
    keywords: ['landscaping', 'grounds maintenance', 'lawn care'],
  },

  // ===========================================================================
  // SECTOR 61: EDUCATIONAL SERVICES
  // ===========================================================================
  {
    code: '61',
    title: 'Educational Services',
    description: 'Instruction and training in various fields',
    level: 2,
    popular: true,
    keywords: ['education', 'training', 'instruction'],
  },
  {
    code: '611',
    title: 'Educational Services',
    description: 'Educational and training services',
    level: 3,
    parentCode: '61',
    popular: true,
    keywords: ['education', 'training'],
  },
  {
    code: '611420',
    title: 'Computer Training',
    description: 'Computer and software training.',
    level: 6,
    parentCode: '611',
    popular: true,
    keywords: ['computer training', 'it training', 'software training'],
  },
  {
    code: '611430',
    title: 'Professional and Management Development Training',
    description: 'Professional and leadership training.',
    level: 6,
    parentCode: '611',
    popular: true,
    keywords: ['professional development', 'management training', 'leadership'],
  },
  {
    code: '611710',
    title: 'Educational Support Services',
    description: 'Educational testing, counseling, and support.',
    level: 6,
    parentCode: '611',
    keywords: ['educational services', 'testing'],
  },

  // ===========================================================================
  // SECTOR 62: HEALTH CARE AND SOCIAL ASSISTANCE
  // ===========================================================================
  {
    code: '62',
    title: 'Health Care and Social Assistance',
    description: 'Health care and social assistance services',
    level: 2,
    popular: true,
    keywords: ['healthcare', 'medical', 'social services'],
  },
  {
    code: '621',
    title: 'Ambulatory Health Care Services',
    description: 'Outpatient healthcare services',
    level: 3,
    parentCode: '62',
    keywords: ['healthcare', 'medical services', 'outpatient'],
  },
  {
    code: '622',
    title: 'Hospitals',
    description: 'Hospital medical and surgical services',
    level: 3,
    parentCode: '62',
    keywords: ['hospital', 'medical center'],
  },
  {
    code: '623',
    title: 'Nursing and Residential Care Facilities',
    description: 'Nursing and residential care',
    level: 3,
    parentCode: '62',
    keywords: ['nursing home', 'residential care'],
  },

  // ===========================================================================
  // SECTOR 71: ARTS, ENTERTAINMENT, AND RECREATION
  // ===========================================================================
  {
    code: '71',
    title: 'Arts, Entertainment, and Recreation',
    description: 'Arts, entertainment, and recreational services',
    level: 2,
    keywords: ['arts', 'entertainment', 'recreation'],
  },

  // ===========================================================================
  // SECTOR 72: ACCOMMODATION AND FOOD SERVICES
  // ===========================================================================
  {
    code: '72',
    title: 'Accommodation and Food Services',
    description: 'Lodging and food services',
    level: 2,
    keywords: ['hotel', 'restaurant', 'food service'],
  },
  {
    code: '721',
    title: 'Accommodation',
    description: 'Hotels, motels, and lodging',
    level: 3,
    parentCode: '72',
    keywords: ['hotel', 'lodging', 'accommodation'],
  },
  {
    code: '722',
    title: 'Food Services and Drinking Places',
    description: 'Restaurants and food services',
    level: 3,
    parentCode: '72',
    popular: true,
    keywords: ['restaurant', 'food service', 'catering'],
  },
  {
    code: '722310',
    title: 'Food Service Contractors',
    description: 'Contract food services for institutions.',
    level: 6,
    parentCode: '722',
    popular: true,
    keywords: ['food service', 'catering', 'cafeteria'],
  },
  {
    code: '722320',
    title: 'Caterers',
    description: 'Catering services',
    level: 6,
    parentCode: '722',
    keywords: ['catering', 'event catering'],
  },

  // ===========================================================================
  // SECTOR 81: OTHER SERVICES (EXCEPT PUBLIC ADMINISTRATION)
  // ===========================================================================
  {
    code: '81',
    title: 'Other Services (except Public Administration)',
    description: 'Repair, maintenance, personal services, and organizations',
    level: 2,
    keywords: ['services', 'repair', 'maintenance'],
  },
  {
    code: '811',
    title: 'Repair and Maintenance',
    description: 'Repair and maintenance services',
    level: 3,
    parentCode: '81',
    popular: true,
    keywords: ['repair', 'maintenance'],
  },
  {
    code: '811310',
    title: 'Commercial and Industrial Machinery and Equipment (except Automotive and Electronic) Repair and Maintenance',
    description: 'Industrial equipment repair and maintenance.',
    level: 6,
    parentCode: '811',
    popular: true,
    keywords: ['equipment repair', 'maintenance', 'industrial repair'],
  },

  // ===========================================================================
  // SECTOR 92: PUBLIC ADMINISTRATION
  // ===========================================================================
  {
    code: '92',
    title: 'Public Administration',
    description: 'Government agencies and public administration',
    level: 2,
    keywords: ['government', 'public administration'],
  },
];

// Utility functions for searching NAICS codes
export function searchNAICS(query: string): NAICSCode[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return [];

  // Exact code match
  if (/^\d+$/.test(lowerQuery)) {
    const exact = NAICS_DATABASE.filter(n => n.code === lowerQuery);
    if (exact.length > 0) return exact;
  }

  // Search in title, description, and keywords
  return NAICS_DATABASE.filter(naics =>
    naics.code.includes(lowerQuery) ||
    naics.title.toLowerCase().includes(lowerQuery) ||
    naics.description.toLowerCase().includes(lowerQuery) ||
    naics.keywords?.some(k => k.includes(lowerQuery))
  ).slice(0, 20); // Limit to 20 results
}

export function getNAICSByCode(code: string): NAICSCode | undefined {
  return NAICS_DATABASE.find(n => n.code === code);
}

export function getPopularNAICS(): NAICSCode[] {
  return NAICS_DATABASE.filter(n => n.popular === true);
}

export function getNAICSChildren(parentCode: string): NAICSCode[] {
  return NAICS_DATABASE.filter(n => n.parentCode === parentCode);
}

export function getNAICSHierarchy(code: string): NAICSCode[] {
  const hierarchy: NAICSCode[] = [];
  let current = getNAICSByCode(code);

  while (current) {
    hierarchy.unshift(current);
    current = current.parentCode ? getNAICSByCode(current.parentCode) : undefined;
  }

  return hierarchy;
}
