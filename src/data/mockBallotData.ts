export interface Candidate {
  id: string;
  name: string;
  party: 'Democratic' | 'Republican' | 'Independent' | 'Nonpartisan';
  office: string;
  category: 'Federal' | 'State' | 'Local';
  hometown: string;
  education: string;
  experience: string;
  avatarSeed: string;
  accentColor: string;
  bio: string;
  keyIssues: {
    topic: string;
    headline: string;
    details: string;
    source: string;
  }[];
  quotes: string;
  topEndorsements: string[];
  campaignFinance: {
    totalRaised: string;
    smallDonorPercent: string;
    pacPercent: string;
    topSectors: string[];
  };
}

export interface Amendment {
  id: string;
  number: number;
  shortTitle: string;
  ballotTitle: string;
  category: 'Environment' | 'Governance' | 'Education' | 'Economy';
  plainEnglishSummary: string;
  officialSummary: string;
  whatYesMeans: string[];
  whatNoMeans: string[];
  supporters: string[];
  opponents: string[];
  argumentsFor: string[];
  argumentsAgainst: string[];
  financialImpact: string;
  historicalContext: string;
}

export interface VotingLocation {
  zip: string;
  city: string;
  county: string;
  precinct: string;
  pollingPlace: string;
  address: string;
  earlyVotingDates: string;
  electionDay: string;
}

export const FLORIDA_SAMPLE_LOCATIONS: Record<string, VotingLocation> = {
  '32801': {
    zip: '32801',
    city: 'Orlando',
    county: 'Orange County',
    precinct: 'Precinct 14 - Metro Center',
    pollingPlace: 'Downtown Orange County Public Library Auditorium',
    address: '101 E Central Blvd, Orlando, FL 32801',
    earlyVotingDates: 'Oct 24 – Nov 1, 2026 (8:00 AM – 8:00 PM)',
    electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
  },
  '33101': {
    zip: '33101',
    city: 'Miami',
    county: 'Miami-Dade County',
    precinct: 'Precinct 502 - Downtown District',
    pollingPlace: 'Stephen P. Clark Government Center (1st Floor)',
    address: '111 NW 1st St, Miami, FL 33128',
    earlyVotingDates: 'Oct 24 – Nov 1, 2026 (7:00 AM – 7:00 PM)',
    electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
  },
  '33602': {
    zip: '33602',
    city: 'Tampa',
    county: 'Hillsborough County',
    precinct: 'Precinct 108 - Riverwalk District',
    pollingPlace: 'Tampa River Center at Julian B. Lane Park',
    address: '402 W Laurel St, Tampa, FL 33607',
    earlyVotingDates: 'Oct 24 – Nov 1, 2026 (7:00 AM – 7:00 PM)',
    electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
  },
  '32202': {
    zip: '32202',
    city: 'Jacksonville',
    county: 'Duval County',
    precinct: 'Precinct 204 - St. Johns River',
    pollingPlace: 'Duval County Supervisor of Elections Main Office',
    address: '105 E Monroe St, Jacksonville, FL 32202',
    earlyVotingDates: 'Oct 24 – Nov 1, 2026 (8:00 AM – 7:00 PM)',
    electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
  },
  '32301': {
    zip: '32301',
    city: 'Tallahassee',
    county: 'Leon County',
    precinct: 'Precinct 3 - Capitol & Downtown',
    pollingPlace: 'Leon County Civic Center & Pavilion',
    address: '505 W Pensacola St, Tallahassee, FL 32301',
    earlyVotingDates: 'Oct 26 – Nov 2, 2026 (10:00 AM – 6:00 PM)',
    electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
  },
  '32601': {
    zip: '32601',
    city: 'Gainesville',
    county: 'Alachua County',
    precinct: 'Precinct 27 - Central District',
    pollingPlace: 'Downtown Alachua County Administration Building',
    address: '12 SE 1st St, Gainesville, FL 32601',
    earlyVotingDates: 'Oct 26 – Nov 2, 2026 (9:00 AM – 6:00 PM)',
    electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
  },
};

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'gov-maya-rodriguez',
    name: 'Maya Rodriguez',
    party: 'Democratic',
    office: 'Governor and Lieutenant Governor',
    category: 'State',
    hometown: 'Tampa, FL',
    education: 'B.A. Political Science, Univ. of Florida; J.D., Florida State University College of Law',
    experience: 'Former State Senator (8 years), Public Interest Environmental Litigator, County Commission Chair',
    avatarSeed: 'maya',
    accentColor: '#1d4ed8',
    bio: 'Maya Rodriguez is an 8-year veteran of the Florida Legislature focused on home insurance reform, public education affordability, and resiliency bonds for Florida infrastructure. She advocates for transparent insurance rate caps and expanding state job-training programs.',
    quotes: '"Floridians should not have to choose between their mortgage and their property insurance premium, nor should working families be priced out of the Sunshine State."',
    topEndorsements: [
      'Florida Teachers & Faculty Association',
      'Everglades Clean Water Coalition',
      'Florida League of Conservation Voters',
      'Sunshine State Small Business Alliance'
    ],
    campaignFinance: {
      totalRaised: '$14.2M',
      smallDonorPercent: '68%',
      pacPercent: '12%',
      topSectors: ['Education & Nonprofits', 'Clean Energy', 'Healthcare Services', 'Individual Grassroots']
    },
    keyIssues: [
      {
        topic: 'Property Insurance & Housing',
        headline: 'Cap predatory insurance surges and expand the state-backed Citizens Insurance safety net.',
        details: 'Proposes expanding the Florida Hurricane Catastrophe Fund reinsurance capacity to lower private reinsurer costs, requiring savings to be directly passed to homeowners with an emergency 15% rate cap review on primary residences.',
        source: 'Florida Senate Bill 1482 Legislative Archive & 2026 Platform Document'
      },
      {
        topic: 'Education & Schools',
        headline: 'Maintain the Bright Futures Scholarship 100% funding and freeze public university tuition.',
        details: 'Supports fully funding state scholarships and expanding career-technical education pathways in Florida public schools.',
        source: 'State Senate Higher Education Committee Record'
      },
      {
        topic: 'Economy & Job Growth',
        headline: 'Invest in aerospace, coastal engineering, and clean energy manufacturing corridors.',
        details: 'Proposes tax incentives for employers that establish registered apprenticeship programs with Florida state colleges.',
        source: 'Florida Chamber of Commerce Candidate Forum 2026'
      },
      {
        topic: 'Environment & Water',
        headline: 'Accelerate Lake Okeechobee reservoir completion and fund red tide mitigation.',
        details: 'Advocates for a dedicated $800M annual state bond for wastewater infrastructure upgrades, storm surge barriers, and aquifer protection.',
        source: 'Everglades Coalition Annual Policy Brief'
      },
      {
        topic: 'Healthcare Access',
        headline: 'Accept federal Medicaid expansion funds and lower prescription drug costs.',
        details: 'Argues bringing $3.2B in federal funds back to Florida would insure 800,000 working Floridians and reduce emergency room overhead across hospitals.',
        source: 'Florida Health Policy Institute Analysis'
      }
    ]
  },
  {
    id: 'gov-david-vance',
    name: 'David Vance',
    party: 'Republican',
    office: 'Governor and Lieutenant Governor',
    category: 'State',
    hometown: 'Naples, FL',
    education: 'B.S. Business Administration, Florida State University; MBA, University of Miami',
    experience: 'State Chief Financial Officer (4 years), Commercial Real Estate Entrepreneur, County Commissioner',
    avatarSeed: 'david',
    accentColor: '#b91c1c',
    bio: 'David Vance is a business owner and current Florida CFO who champions low taxes, legal tort reform to curb insurance lawsuit costs, school choice vouchers, and preserving Florida’s zero personal income tax status.',
    quotes: '"Florida’s economic growth is built on low taxes, individual freedom, and fiscal discipline. We will fix our property insurance market through litigation integrity, not government price-fixing."',
    topEndorsements: [
      'Florida Chamber of Commerce',
      'Associated Industries of Florida',
      'Florida Police Benevolent Association',
      'National Federation of Independent Business (NFIB Florida)'
    ],
    campaignFinance: {
      totalRaised: '$18.9M',
      smallDonorPercent: '39%',
      pacPercent: '34%',
      topSectors: ['Commercial Real Estate', 'Financial Services', 'Retail & Hospitality', 'Construction']
    },
    keyIssues: [
      {
        topic: 'Property Insurance & Housing',
        headline: 'Eliminate frivolous trial litigation and expand My Safe Florida Home grants.',
        details: 'Argues insurance rate increases are driven by litigation abuse. Proposes hardening grants of up to $15,000 for roof and storm shutter retrofits through the My Safe Florida Home program.',
        source: 'Florida Office of Insurance Regulation Public Hearing Remarks'
      },
      {
        topic: 'Education & Schools',
        headline: 'Expand universal school choice scholarships and align degrees with high-wage industry demand.',
        details: 'Supports expanding Family Empowerment Scholarships for K-12 education and performance-based state funding for higher education based on graduate median wages.',
        source: 'Florida Board of Governors Summit'
      },
      {
        topic: 'Economy & Job Growth',
        headline: 'Protect Florida’s zero personal income tax and cut commercial lease sales taxes.',
        details: 'Proposes phasing out the remaining commercial lease tax to lower rent costs for small businesses, while streamlining occupational licensing for skilled trades.',
        source: 'Florida TaxWatch Gubernatorial Forum'
      },
      {
        topic: 'Environment & Water',
        headline: 'Targeted Everglades restoration investments without burdensome land-use mandates.',
        details: 'Supports $650M in annual appropriations for stormwater treatment areas while protecting private property rights along the Kissimmee basin.',
        source: 'Florida Dept. of Environmental Protection Budget Testimony'
      },
      {
        topic: 'Healthcare Access',
        headline: 'Promote free-market healthcare transparency and cross-state insurance purchasing.',
        details: 'Opposes federal Medicaid expansion citing long-term state budget liabilities; proposes expanding association health plans for small business owners.',
        source: 'Foundation for Government Accountability Policy Paper'
      }
    ]
  },
  {
    id: 'gov-alex-chen',
    name: 'Alex Chen',
    party: 'Independent',
    office: 'Governor and Lieutenant Governor',
    category: 'State',
    hometown: 'Orlando, FL',
    education: 'B.S. Urban Planning, University of Central Florida; M.S. Data Science, Georgia Tech',
    experience: 'Former Municipal Resilience Director, Civic Tech Founder, Florida Independent Coalition Co-Founder',
    avatarSeed: 'alex',
    accentColor: '#ea580c',
    bio: 'Alex Chen is a civic technologist and former municipal resilience director running as an independent. Chen emphasizes pragmatic, nonpartisan problem-solving: tackling Florida’s insurance crisis with actuarial transparency, solar microgrids, and open government data.',
    quotes: '"Hurricanes do not check your voter registration card before making landfall. Florida needs solutions grounded in science and accounting, not party talking points."',
    topEndorsements: [
      'Florida Forward Independent Coalition',
      'Sunshine Tech Civic Network',
      'Florida Solar Energy Cooperative'
    ],
    campaignFinance: {
      totalRaised: '$2.8M',
      smallDonorPercent: '88%',
      pacPercent: '0%',
      topSectors: ['Tech Professionals', 'Small Business Owners', 'Engineers', 'Local Residents']
    },
    keyIssues: [
      {
        topic: 'Property Insurance & Housing',
        headline: 'Open-source actuarial risk models and launch community neighborhood micro-reinsurance pools.',
        details: 'Advocates for creating an independent citizen board with public audit access to insurance risk algorithms, plus state matching funds for flood barrier installations.',
        source: 'Candidate White Paper: Restoring Florida Home Market Solvency'
      },
      {
        topic: 'Education & Schools',
        headline: 'Expand career-technical apprenticeship pipelines and statewide public library funding.',
        details: 'Proposes debt-free community vocational programs and state matching grants for public school STEM labs.',
        source: 'Florida Public Policy Forum Address'
      },
      {
        topic: 'Economy & Job Growth',
        headline: 'Support small business entrepreneurship and invest in regional passenger rail.',
        details: 'Supports expanding Brightline corridors and establishing regional seed grant incubators across Florida counties.',
        source: 'Florida Urban Planning Association Keynote'
      },
      {
        topic: 'Environment & Water',
        headline: 'Nature-based coastal protection: restoring 100,000 acres of mangroves.',
        details: 'Restoring coastal wetlands to absorb storm surges, which reduces insurance risk and protects local fisheries simultaneously.',
        source: 'Florida Marine Science Symposium 2026'
      },
      {
        topic: 'Healthcare Access',
        headline: 'Mobile health and mental wellness units for underserved rural counties.',
        details: 'Advocates for using state settlement funds to seed preventative health clinics and expand nurse practitioner independent practice rights.',
        source: 'Florida Public Health Association Symposium'
      }
    ]
  },
  {
    id: 'sen-elena-morales',
    name: 'Elena Morales',
    party: 'Republican',
    office: 'United States Senator',
    category: 'Federal',
    hometown: 'Miami, FL',
    education: 'B.A. International Relations, Florida International University; J.D., Columbia Law School',
    experience: 'U.S. Representative (6 years), Former Assistant U.S. Attorney for the Southern District of Florida',
    avatarSeed: 'elena',
    accentColor: '#dc2626',
    bio: 'Elena Morales is a third-term Congresswoman and former federal prosecutor representing South Florida. She advocates for strengthening national security, expanding Florida’s space commercialization footprint, and lowering federal taxes.',
    quotes: '"From Cape Canaveral to Key West, Florida is America’s launchpad for freedom, innovation, and economic leadership."',
    topEndorsements: [
      'Florida Aerospace Manufacturers Council',
      'Veterans of Foreign Wars Florida PAC',
      'Florida Farm Bureau Federation'
    ],
    campaignFinance: {
      totalRaised: '$21.4M',
      smallDonorPercent: '44%',
      pacPercent: '30%',
      topSectors: ['Aerospace & Defense', 'Agriculture', 'Maritime Shipping', 'Financial Management']
    },
    keyIssues: [
      {
        topic: 'Property Insurance & Housing',
        headline: 'Federal backstop for catastrophic hurricane losses above $50B.',
        details: 'Sponsors legislation to create a National Catastrophe Reinsurance Consortium to ensure extreme multi-storm seasons do not bankrupt regional homeowners insurance markets.',
        source: 'U.S. House Financial Services Committee Testimony'
      },
      {
        topic: 'Economy & Job Growth',
        headline: 'Onshore critical pharmaceutical and semiconductor manufacturing in Florida ports.',
        details: 'Author of the American Port Resiliency Act to expand deep-water container berths at Port Everglades, Port Tampa Bay, and JAXPORT.',
        source: 'U.S. House Transportation Committee Report'
      },
      {
        topic: 'Environment & Water',
        headline: 'Full federal authorization for Comprehensive Everglades Restoration Plan (CERP) projects.',
        details: 'Secured $450M in federal Army Corps of Engineers funding for the EAA Reservoir and Southern Everglades seepage barriers.',
        source: 'Everglades Federal Funding Oversight Hearing'
      }
    ]
  },
  {
    id: 'sen-marcus-holloway',
    name: 'Marcus Holloway',
    party: 'Democratic',
    office: 'United States Senator',
    category: 'Federal',
    hometown: 'Jacksonville, FL',
    education: 'B.S. Civil Engineering, Florida A&M University; Master of Public Administration, Harvard Kennedy School',
    experience: 'County Commissioner (6 years), Navy Veteran (Civil Engineer Corps, 8 years), Small Business Founder',
    avatarSeed: 'marcus',
    accentColor: '#2563eb',
    bio: 'Marcus Holloway is a Navy veteran, civil engineer, and former local commissioner from Northeast Florida. He champions federal flood insurance affordability, military veteran healthcare modernization, and infrastructure modernization.',
    quotes: '"As a civil engineer who wore the nation’s uniform, I know resilience is about keeping water out of living rooms and putting dignity into paychecks."',
    topEndorsements: [
      'VoteVets PAC',
      'Florida AFL-CIO Workers Council',
      'Sierra Club Florida',
      'National Association of Letter Carriers'
    ],
    campaignFinance: {
      totalRaised: '$17.1M',
      smallDonorPercent: '72%',
      pacPercent: '11%',
      topSectors: ['Veterans & Defense Workers', 'Renewable Energy', 'Civil Engineering & Labor', 'Online Grassroots']
    },
    keyIssues: [
      {
        topic: 'Property Insurance & Housing',
        headline: 'Cap National Flood Insurance Program (NFIP) annual premium increases at 9%.',
        details: 'Argues current federal flood insurance recalculations are pricing working families and seniors out of coastal and inland riverfront homes in Florida.',
        source: 'U.S. Senate Banking Committee Witness Statement'
      },
      {
        topic: 'Economy & Job Growth',
        headline: 'Federal investments in port electrification, grid modernization, and storm hardening.',
        details: 'Advocates for Florida to become a regional hub for grid modernization and hurricane-hardened transformers.',
        source: 'Florida Energy & Infrastructure Summit'
      },
      {
        topic: 'Environment & Water',
        headline: 'Designate the Florida Wildlife Corridor as a National Ecological Heritage Area.',
        details: 'Proposes $1.2B in federal conservation easement matching funds to protect wildlife migration corridors between the Everglades and Osceola National Forest.',
        source: 'Florida Wildlife Corridor Foundation Summit 2026'
      }
    ]
  },
  {
    id: 'local-raymond-ortiz',
    name: 'Dr. Raymond Ortiz',
    party: 'Nonpartisan',
    office: 'County Commissioner, District 2',
    category: 'Local',
    hometown: 'Alachua County, FL',
    education: 'Ph.D. Civil Systems & Urban Planning, University of Florida',
    experience: 'County Planning Commissioner (6 years), Transportation Researcher, Neighborhood Association President',
    avatarSeed: 'raymond',
    accentColor: '#059669',
    bio: 'Dr. Raymond Ortiz has served on the local planning board for six years. He prioritizes smart infill transit-oriented development near job centers, preserving canopy roads, and expanding protected bike trails.',
    quotes: '"Local government is where asphalt meets reality. We can grow our tax base while keeping our neighborhoods quiet and our waterways clean."',
    topEndorsements: [
      'Alachua County Conservation Trust',
      'Florida Bicycle & Transit Association',
      'Local Firefighters Union Local 3852'
    ],
    campaignFinance: {
      totalRaised: '$180,000',
      smallDonorPercent: '82%',
      pacPercent: '2%',
      topSectors: ['Local Residents', 'County Staff', 'Transit Advocates']
    },
    keyIssues: [
      {
        topic: 'Local Housing & Rent',
        headline: 'Incentivize workforce housing near rapid bus corridors with expedited permitting.',
        details: 'Proposes eliminating outdated parking minimums for affordable developments along public transit corridors to lower apartment construction costs.',
        source: 'County Commission Candidate Debate'
      },
      {
        topic: 'Environment & Springs',
        headline: 'Mandate advanced septic-to-sewer conversions near local springs and rivers.',
        details: 'Securing state matching grants so homeowners do not shoulder the full $12,000 cost of septic conversions near sensitive aquifer basins.',
        source: 'County Environmental Protection Dept. Brief'
      }
    ]
  },
  {
    id: 'local-rachel-bennett',
    name: 'Rachel Bennett',
    party: 'Nonpartisan',
    office: 'County Commissioner, District 2',
    category: 'Local',
    hometown: 'Alachua County, FL',
    education: 'B.S. Accounting, Florida State University; Certified Public Accountant (CPA)',
    experience: 'Small Business Owner (Bennett Accounting Services, 18 years), Chamber of Commerce Treasurer',
    avatarSeed: 'rachel',
    accentColor: '#d97706',
    bio: 'Rachel Bennett is a certified public accountant and 18-year local small business owner. Her platform centers on auditing county expenditures to prevent property tax millage rate hikes, supporting first responders, and upgrading roads.',
    quotes: '"Before we ask working families to pay higher property taxes, we must ensure every existing tax dollar is spent with forensic precision."',
    topEndorsements: [
      'Local Builders Association',
      'Police Benevolent Chapter',
      'Small Business Roundtable of North Central Florida'
    ],
    campaignFinance: {
      totalRaised: '$210,000',
      smallDonorPercent: '61%',
      pacPercent: '18%',
      topSectors: ['Local Small Businesses', 'Real Estate & Construction', 'Professional Services']
    },
    keyIssues: [
      {
        topic: 'Local Housing & Rent',
        headline: 'Reduce county impact fees on single-family starter homes and simplify zoning.',
        details: 'Argues high municipal impact fees add up to $18,000 to the cost of a new modest starter home, pricing out young families and nurses.',
        source: 'Chamber of Commerce Election Panel'
      },
      {
        topic: 'Taxes & County Budget',
        headline: 'Enact a rollback millage rate to offset inflationary property assessment spikes.',
        details: 'Advocates for capping annual county budget increases to the rate of population growth plus inflation.',
        source: 'County Commission Budget Public Hearing'
      }
    ]
  }
];

export const MOCK_AMENDMENTS: Amendment[] = [
  {
    id: 'amendment-1',
    number: 1,
    shortTitle: 'Nonpartisan School Board Elections & Technical Apprenticeships',
    ballotTitle: 'Constitutional Amendment to Require Nonpartisan Elections for School Board Members and Modernize Career-Technical Apprenticeship Funding',
    category: 'Education',
    plainEnglishSummary: 'Keeps school board candidate races nonpartisan on the ballot (no party labels next to candidate names) and guarantees dedicated state lottery funding for high school and career technical apprenticeships.',
    officialSummary: 'Proposing an amendment to the State Constitution to maintain nonpartisan elections for county school board members, prohibiting political party labels on school district ballots, and establishing a dedicated vocational education endowment from Florida Education Lottery revenues.',
    whatYesMeans: [
      'School board candidates run without political party affiliations (Democrat/Republican) displayed on the ballot.',
      'All registered voters (including Independents and No Party Affiliation) can vote in school board elections.',
      'Guarantees at least 5% of Florida lottery proceeds go directly to vocational, trade, and apprenticeship training equipment.',
      'Prevents state political party committees from directly financing local school board endorsement campaigns.'
    ],
    whatNoMeans: [
      'The Florida Legislature would be permitted to establish partisan school board elections with party primaries.',
      'Independent and NPA voters could potentially be excluded from closed party primaries for school board races in August.',
      'Lottery revenues remain under the standard general education allocation without a guaranteed trade carve-out.',
      'Existing school board campaign finance and election structures stay as they are.'
    ],
    supporters: [
      'League of Women Voters of Florida',
      'Florida PTA (Parent Teacher Association)',
      'Associated Builders and Contractors of Florida',
      'Nonpartisan Education Coalition'
    ],
    opponents: [
      'Florida Political Party Executive Committees',
      'Americans for Partisan Accountability',
      'Some partisan legislative caucuses'
    ],
    argumentsFor: [
      'Education decisions (class sizes, school safety, career readiness) should focus on students rather than partisan national debates.',
      'Allows Florida’s 4 million Independent and NPA voters to have a voice on who leads their local public schools.',
      'Provides hands-on funding for welding, nursing, aviation mechanics, and coding programs without raising taxes.'
    ],
    argumentsAgainst: [
      'Critics argue party labels provide useful shorthand for voters about a candidate’s underlying philosophy on spending.',
      'Earmarking lottery funds for specific programs could reduce discretionary funding available for general classroom teachers.'
    ],
    financialImpact: 'No direct tax increase. Establishes a $120M annual re-allocation of existing Florida Lottery proceeds toward career-technical equipment grants.',
    historicalContext: 'Florida voters approved nonpartisan school boards in 1998 with 64% of the vote. This amendment reinforces that standard.'
  },
  {
    id: 'amendment-2',
    number: 2,
    shortTitle: 'Clean Coastal Waterways & Wetland Resilience Trust',
    ballotTitle: 'Constitutional Amendment to Establish the Clean Coastal Waters and Coral Reef Protection Trust Fund',
    category: 'Environment',
    plainEnglishSummary: 'Dedicates 1% of the state documentary stamp tax (real estate transaction fees) into a protected trust fund for red tide prevention, coral reef protection, and water quality monitoring.',
    officialSummary: 'Proposing an amendment to Article X of the State Constitution to establish the Clean Coastal Waters Trust Fund, dedicating revenues derived from excise taxes on documents to coastal water quality monitoring, red tide mitigation research, coral reef disease response, and living shoreline restoration.',
    whatYesMeans: [
      'Creates a constitutionally protected trust fund that the Legislature cannot divert to other state budget areas.',
      'Funds scientific monitoring and immediate mitigation teams for toxic algae blooms and red tide outbreaks that harm tourism and public health.',
      'Finances living shorelines, mangrove restoration, and oyster bed seeding to naturally buffer hurricane storm surges.',
      'Provides competitive grants to marine research labs across Florida.'
    ],
    whatNoMeans: [
      'No constitutional trust fund will be established; coastal water quality projects will continue to compete annually for general revenue appropriations.',
      'The Legislature maintains complete discretion over documentary stamp tax revenues each fiscal year.',
      'State funding for red tide research and reef restoration remains subject to changing legislative budget priorities.'
    ],
    supporters: [
      'Florida Wildlife Federation',
      'Sanibel-Captiva Conservation Foundation',
      'Florida Restaurant and Lodging Association (coastal tourism)',
      'Captains for Clean Water'
    ],
    opponents: [
      'Florida TaxWatch (concerns regarding constitutional budget earmarks)',
      'Associated Industries of Florida (recommends legislative budget flexibility)'
    ],
    argumentsFor: [
      'Florida’s $100B tourism and fishing economies depend entirely on clean, non-toxic water.',
      'Coral reefs and mangroves reduce coastal wave energy by up to 70% during hurricanes, acting as natural seawalls.',
      'Dedicates existing real estate fees without raising property or sales taxes on residents.'
    ],
    argumentsAgainst: [
      'Budget analysts caution that putting revenue formulas in the Florida Constitution restricts the state’s ability to respond during future economic recessions.',
      'Some argue existing environmental agencies (DEP and FWC) already have statutory authority to fund clean water projects.'
    ],
    financialImpact: 'Dedicates an estimated $280M annually from existing documentary stamp revenues to clean water and reef trust funds. No new taxes or fee increases.',
    historicalContext: 'Follows major toxic red tide and blue-green algae blooms across Lake Okeechobee and Florida coastlines that prompted bipartisan calls for permanent water funding.'
  },
  {
    id: 'amendment-3',
    number: 3,
    shortTitle: 'Citizen Initiative Ballot Threshold Adjustment',
    ballotTitle: 'Constitutional Amendment to Adjust Voter Approval Threshold for Citizen-Sponsored Constitutional Amendments from 60% to 55%',
    category: 'Governance',
    plainEnglishSummary: 'Changes the percentage of voter approval needed to pass a citizen-led constitutional amendment in Florida from 60% down to 55%. The threshold for amendments proposed by politicians in the Legislature would remain at 60%.',
    officialSummary: 'Proposing an amendment to Section 5 of Article XI of the State Constitution to reduce the elector approval threshold required for constitutional amendments proposed by citizen initiative from sixty percent (60%) to fifty-five percent (55%), while maintaining the sixty percent threshold for legislatively referred amendments.',
    whatYesMeans: [
      'A citizen-led amendment would need 55% of the vote (instead of 60%) to become part of the Florida Constitution.',
      'Makes it slightly easier for grassroots citizen petitions that achieve majority support to pass into law.',
      'Restores a threshold closer to the historical simple majority standard that Florida used prior to 2006.'
    ],
    whatNoMeans: [
      'The threshold for passing all constitutional amendments in Florida remains at 60% supermajority approval.',
      'Citizen initiatives that receive 55% to 59.9% of the vote will continue to fail, even if supported by a clear majority of voters.',
      'The Florida Constitution remains harder to amend than in states requiring a simple 50% + 1 majority.'
    ],
    supporters: [
      'Florida Decides Coalition',
      'Common Cause Florida',
      'ACLU of Florida',
      'Florida Citizen Voting Rights Network'
    ],
    opponents: [
      'Florida Chamber of Commerce',
      'Defend Florida’s Constitution PAC',
      'Florida Farm Bureau Federation'
    ],
    argumentsFor: [
      'Ensures that citizen-initiated democracy cannot be blocked by a 41% minority of voters.',
      'Citizens only turn to constitutional petitions when the state legislature repeatedly refuses to address popular public priorities.',
      '55% still represents a solid supermajority consensus while preventing gridlock.'
    ],
    argumentsAgainst: [
      'A state constitution is a foundational legal document that should be stable and protected from frequent changes.',
      'Opponents argue out-of-state interest groups spend millions to insert special policies into Florida’s constitution.'
    ],
    financialImpact: 'No direct fiscal impact on state or local government revenues or expenditures.',
    historicalContext: 'Before 2006, Florida required a simple majority (50% + 1) to pass amendments. In 2006, voters approved Amendment 3 raising the bar to 60%.'
  },
  {
    id: 'amendment-4',
    number: 4,
    shortTitle: 'Property Insurance Catastrophe Stabilization Fund Reform',
    ballotTitle: 'Constitutional Amendment Authorizing State-Backed Catastrophe Reinsurance Pool Expansion and Premium Relief Rebates',
    category: 'Economy',
    plainEnglishSummary: 'Authorizes the state to expand the Florida Hurricane Catastrophe Fund to offer lower-cost reinsurance to qualified home insurers, requiring participating companies to pass savings directly to homeowners in verified rate reductions.',
    officialSummary: 'Proposing an amendment to Article VII and Article X of the State Constitution to authorize the Florida Hurricane Catastrophe Fund to expand below-market reinsurance layers to residential insurers operating within the state, mandating that actuarially verified reinsurance savings result in direct rate credits on consumer property insurance policies.',
    whatYesMeans: [
      'The state can issue up to $10B in contingency stabilization bonds to absorb major hurricane losses before private insurers run out of money.',
      'Participating insurers must legally pass on verified cost savings directly into lower annual homeowner and condo insurance premiums.',
      'Reduces the likelihood of private insurers going bankrupt after a Category 4 or 5 hurricane hits Florida.',
      'Includes mandatory annual independent audits of insurance executive bonuses and reinsurance purchase contracts.'
    ],
    whatNoMeans: [
      'The state Catastrophe Fund remains at current statutory reinsurance caps.',
      'Private insurance companies continue to purchase expensive global reinsurance on the open international market, passing costs to Florida consumers.',
      'State taxpayers avoid potential bond liabilities in the event of an unprecedented multi-hurricane season.'
    ],
    supporters: [
      'Floridians for Affordable Insurance Relief',
      'Florida Realtors Association',
      'Senior Citizens Housing Protection Coalition',
      'Florida Condo Owners Defense Network'
    ],
    opponents: [
      'Free Market Consumer Protection Institute',
      'Some fiscal conservative budget watchdog groups'
    ],
    argumentsFor: [
      'Average Florida home insurance premiums have surged over 250% in five years, threatening homeownership for families and retirees.',
      'Reinsurance costs account for nearly 45% of every insurance bill in Florida; state-backed pooling is 30% cheaper than private offshore reinsurers.',
      'Enforces strict transparency so insurance companies cannot pocket state savings as corporate profits.'
    ],
    argumentsAgainst: [
      'If two mega-hurricanes strike major metro areas in the same year, state taxpayers could face emergency assessments on their auto and home policies.',
      'Critics prefer free-market solutions and further tort litigation reform rather than expanding state-backed financial commitments.'
    ],
    financialImpact: 'Authorizes up to $10B in revenue bond capacity. Projected to yield consumer premium savings of 12% to 18% statewide.',
    historicalContext: 'Over a dozen private insurers have become insolvent or left Florida since 2020, making insurance affordability the single highest-polling issue for voters of all political parties in Florida.'
  }
];

export const MOCK_AI_KNOWLEDGE_BASE = [
  {
    keywords: ['property insurance', 'insurance crisis', 'insurance', 'home insurance', 'rates', 'citizens'],
    plainEnglish: `Florida’s property insurance crisis is currently one of the top issues on the ballot. Over the past 5 years, average home insurance rates in Florida have risen more than 200%, with many homeowners paying $4,000 to $9,000+ per year.

Here is how the candidates and ballot measures address it:
• Maya Rodriguez (Democrat) supports capping rate increases on primary residences, expanding the state-backed Citizens Insurance safety net, and holding private insurers to strict audit standards.
• David Vance (Republican) emphasizes legal tort reform to stop frivolous litigation, attracting national private carriers by removing regulations, and expanding $15,000 "My Safe Florida Home" hardening grants for roofs and storm shutters.
• Alex Chen (Independent) advocates for open-source actuarial risk models, community micro-insurance pools, and eliminating opaque offshore reinsurance markups.
• Amendment 4 on this ballot specifically proposes expanding the state Catastrophe Fund to offer lower-cost reinsurance with mandatory rate reductions for homeowners.`,
    studentAngle: `For all Floridians and renters: Landlords bake their property insurance premiums directly into monthly rent. When property insurance surges, rent spikes $200–$400 a month across Florida cities.`,
    policyAngle: `Florida represents only 9% of all U.S. homeowners insurance claims, but historically accounted for over 70% of homeowners insurance lawsuits due to one-way attorney fee statutes. Recent legislative sessions restricted these lawsuits, but global reinsurance rates and back-to-back hurricane seasons continue to put upward pressure on premiums.`
  },
  {
    keywords: ['amendment 2', 'clean water', 'red tide', 'coral reef', 'waterways', 'environment'],
    plainEnglish: `Amendment 2 creates a dedicated, constitutionally protected trust fund specifically for Florida's waterways, red tide prevention, and coral reef protection. It dedicates 1% of the existing state documentary stamp tax (the fee paid when real estate is bought and sold) to clean water and living shorelines.

• A YES vote means: The money is locked into clean water projects and cannot be diverted by the legislature for other budget items.
• A NO vote means: Clean water projects must compete each year in the regular state budget, and no new constitutional fund is created.
• Cost: No new taxes; it redirects an estimated $280M per year from existing real estate stamp fees.`,
    studentAngle: `Clean water directly protects Florida's $100B tourism, commercial fishing, and coastal quality of life.`,
    policyAngle: `The amendment amends Article X of the Florida Constitution. Critics like Florida TaxWatch note that constitutionally earmarking funds restricts the legislature's fiscal agility during economic downturns, whereas environmental advocates argue statutory funding is too easily diverted during boom-and-bust cycles.`
  },
  {
    keywords: ['id to vote', 'bring to vote', 'polling place', 'what do i need', 'voting requirements', 'voter id'],
    plainEnglish: `To vote in person in Florida, you must present a current and valid photo and signature identification at your polling place.

Approved forms of photo ID in Florida (F.S. § 101.043) include:
1. Florida Driver License or Florida State ID Card (issued by DHSMV)
2. U.S. Passport or U.S. Passport Card
3. Student ID card (from any Florida university, college, or high school)
4. Military ID or Veteran Health ID
5. Debit or Credit Card with your photo
6. Neighborhood Association ID or Public Assistance ID

If your primary photo ID does not have your signature on it, you can simply show a second card with your signature (such as a signed debit or credit card). Both together meet the Florida legal requirement!`,
    studentAngle: `You can register to vote at your current residence or hometown address, but you can only vote in one precinct. Early voting is available across all 67 Florida counties!`,
    policyAngle: `Florida Statute § 101.043 governs elector identification. If you do not have any valid photo/signature ID on Election Day, poll workers are legally required to offer you a Provisional Ballot. If your signature on the provisional ballot matches your voter registration file, your vote counts automatically.`
  },
  {
    keywords: ['amendment 3', 'threshold', '60%', '55%', 'supermajority', 'citizen initiative'],
    plainEnglish: `Amendment 3 asks whether Florida should lower the voting threshold required to pass citizen-led constitutional amendments from 60% down to 55%.

• Right now: A citizen initiative must win at least 60% of the vote to pass (a very high bar).
• If Amendment 3 passes: Citizen initiatives would pass with 55% or more of the vote.
• If Amendment 3 fails: The threshold stays at 60%.

Note: Amendments proposed directly by politicians in the state legislature will still require 60%.`,
    studentAngle: `Many grassroots citizen ballot campaigns that win majority support (such as minimum wage or clean water measures) receive 55% to 59% of the vote, but fail under the 60% rule.`,
    policyAngle: `Florida used a simple majority (50% + 1) for all amendments from 1885 until 2006, when voters approved raising the standard to 60%. Florida is one of only three states with a supermajority requirement this high for citizen ballot initiatives.`
  },
  {
    keywords: ['county commissioner', 'commission', 'local government', 'what does a commissioner do'],
    plainEnglish: `A County Commissioner is one of the most impactful local elected officials on your ballot. Your County Commission controls:

1. Local property taxes and county budget allocations.
2. Zoning & Land Use: What gets built where (housing developments vs. commercial centers vs. parks).
3. Roads, sidewalks, traffic lights, and public bus transit systems.
4. County parks, library systems, water drainage, and hurricane emergency management.
5. First responder funding (Sheriff’s office, local fire rescue, and paramedics).

In this election, candidates differ on whether to prioritize public transit and workforce housing vs. lowering business impact fees and capping county spending.`,
    studentAngle: `Local commissions decide whether your roads get paved, safe bike lanes, public transit schedules, and emergency storm shelter staffing.`,
    policyAngle: `County commissions operate under Florida Home Rule powers (Article VIII of the Florida Constitution) and enact local county ordinances enforceable within county boundaries.`
  }
];

export const COMPARISON_TOPICS = [
  'Property Insurance & Housing Crisis',
  'Education & School Funding',
  'Healthcare & Mental Health Access',
  'Economic Growth & State Taxes',
  'Water Quality & Coastal Hurricane Resilience'
];
