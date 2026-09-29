import sys
import re

NEW_QPS = """
    # -------------------------------------------------------------------------
    # 21. AGRICULTURE - ORGANIC GROWER (ASCI)
    # -------------------------------------------------------------------------
    {
        "qp_code": "AGR/Q1202",
        "qualification_name": "Organic Grower / Organic Farming Specialist",
        "nsqf_level": "Level 4",
        "sector": "Agriculture",
        "council": "Agriculture Skill Council of India (ASCI)",
        "min_education": "5th Standard",
        "preferred_education": "8th or 10th Standard",
        "min_experience_years": 0.5,
        "training_duration_hours": 240,
        "official_scheme": "PMKVY 4.0 / Paramparagat Krishi Vikas Yojana (PKVY)",
        "description": "Cultivates crops using organic practices, prepares bio-fertilizers, vermicompost, and manages non-chemical pest controls.",
        "required_skills": [
            "Organic Soil Enrichment & Bio-Pesticide Preparation",
            "Micro-Irrigation & Drip System Installation",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "AGR/N1203",
                "title": "Prepare vermicompost, jeevamrutha, and organic soil conditioners per organic standards",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Organic Soil Enrichment & Bio-Pesticide Preparation"]
            },
            {
                "nos_code": "AGR/N1204",
                "title": "Implement botanical decoctions (neemastra, agniastra) for integrated organic pest management",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Organic Soil Enrichment & Bio-Pesticide Preparation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Organic Farm Supervisor", "Agri-Extension Executive"],
            "potential_monthly_income": "₹16,000 - ₹26,000 / month",
            "readiness_summary": "High demand in organic export farms, FPOs (Farmer Producer Organizations), and agro-retail."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Organic Produce Cultivation & Direct Farm-to-Consumer Micro-Brand",
            "potential_monthly_income": "₹25,000 - ₹60,000 / month",
            "required_resources": ["farmland lease", "vermicompost pits", "drip irrigation kit", "two wheeler"],
            "readiness_summary": "Premium pricing for certified chemical-free vegetables, pulses, and greens."
        }
    },

    # -------------------------------------------------------------------------
    # 22. AGRICULTURE - DAIRY FARMER / ENTREPRENEUR (ASCI)
    # -------------------------------------------------------------------------
    {
        "qp_code": "AGR/Q4101",
        "qualification_name": "Dairy Farmer / Entrepreneur",
        "nsqf_level": "Level 4",
        "sector": "Agriculture",
        "council": "Agriculture Skill Council of India (ASCI)",
        "min_education": "5th Standard",
        "preferred_education": "8th Standard",
        "min_experience_years": 0.5,
        "training_duration_hours": 200,
        "official_scheme": "PMKVY 4.0 / National Livestock Mission & PM Matsya/Dairy",
        "description": "Manages milch cattle/buffalo breeds, scientific fodder feeding, hygienic machine milking, and disease prevention.",
        "required_skills": [
            "Livestock Care & Cattle Housing Management",
            "Hygienic Milking & Chilling Operations",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "AGR/N4101",
                "title": "Provide balanced ration feeding, silage preparation, and cattle shed sanitation",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Livestock Care & Cattle Housing Management"]
            },
            {
                "nos_code": "AGR/N4102",
                "title": "Perform hygienic manual/machine milking and operate bulk milk cooling units",
                "urgency": "High",
                "criticality": "Quality Assurance",
                "related_skills": ["Hygienic Milking & Chilling Operations"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Dairy Plant Assistant", "Milk Procurement Executive"],
            "potential_monthly_income": "₹15,000 - ₹24,000 / month",
            "readiness_summary": "Employment in cooperative dairies (Amul, Aavin, Nandini) and private milk aggregators."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Micro Dairy Farm & Packaged Milk / Ghee Enterprise",
            "potential_monthly_income": "₹30,000 - ₹80,000 / month",
            "required_resources": ["cattle shed", "milking cans / machine", "milch cows", "fodder cutter"],
            "readiness_summary": "Strong steady cash flow supported by NABARD dairy entrepreneurship subsidies."
        }
    },

    # -------------------------------------------------------------------------
    # 23. AUTOMOTIVE - AUTOMOTIVE ELECTRICIAN (ASDC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "ASC/Q1402",
        "qualification_name": "Automotive Electrician",
        "nsqf_level": "Level 4",
        "sector": "Automotive",
        "council": "Automotive Skills Development Council (ASDC)",
        "min_education": "8th Standard",
        "preferred_education": "10th Standard or ITI",
        "min_experience_years": 0.5,
        "training_duration_hours": 350,
        "official_scheme": "PMKVY 4.0 / NAPS Apprenticeship",
        "description": "Diagnoses, overhauls, and repairs vehicle electrical systems, starters, alternators, sensors, and lighting looms.",
        "required_skills": [
            "Domestic Electrical Wiring & Switchgear Installation",
            "Multimeter Testing & Fault Diagnosis",
            "Two-Wheeler Engine & Transmission Servicing"
        ],
        "competencies": [
            {
                "nos_code": "ASC/N1402",
                "title": "Inspect wiring harness, fuse boxes, relays, and starter motors using diagnostic scan tools",
                "urgency": "High",
                "criticality": "Testing & Diagnosis",
                "related_skills": ["Multimeter Testing & Fault Diagnosis"]
            },
            {
                "nos_code": "ASC/N1403",
                "title": "Overhaul vehicle battery charging systems, alternators, and auxiliary electrical fittings",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Domestic Electrical Wiring & Switchgear Installation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Auto Electrician", "Diagnostic Specialist"],
            "potential_monthly_income": "₹18,000 - ₹30,000 / month",
            "readiness_summary": "Authorized car dealership workshops (Maruti, Hyundai, Tata) and multi-brand service centers."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Auto Electrical & Battery Diagnostic Workshop",
            "potential_monthly_income": "₹28,000 - ₹65,000 / month",
            "required_resources": ["digital multimeter", "battery load tester", "soldering iron", "OBD scanner"],
            "readiness_summary": "Consistent roadside assistance and vehicle electrical troubleshooting demand."
        }
    },

    # -------------------------------------------------------------------------
    # 24. CONSTRUCTION - BAR BENDER & STEEL FIXER (CSDCI)
    # -------------------------------------------------------------------------
    {
        "qp_code": "CON/Q0203",
        "qualification_name": "Bar Bender and Steel Fixer",
        "nsqf_level": "Level 4",
        "sector": "Construction",
        "council": "Construction Skill Development Council of India (CSDCI)",
        "min_education": "5th Standard",
        "preferred_education": "8th Standard",
        "min_experience_years": 0.5,
        "training_duration_hours": 350,
        "official_scheme": "PMKVY 4.0 / PM Vishwakarma",
        "description": "Reads structural engineering bar bending schedules (BBS), cuts, bends, and ties rebars for RCC foundations, beams, and slabs.",
        "required_skills": [
            "Rebar Cutting & Mechanical Bending",
            "Steel Binding & Schedule Interpretation",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "CON/N0203",
                "title": "Interpret BBS drawings, calculate cutting lengths, and operate mechanical rebar benders",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Rebar Cutting & Mechanical Bending"]
            },
            {
                "nos_code": "CON/N0204",
                "title": "Fix and tie reinforcement cages for columns, beams, and slabs with binding wire",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Steel Binding & Schedule Interpretation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Lead Bar Bender", "Reinforcement Foreman"],
            "potential_monthly_income": "₹18,000 - ₹32,000 / month",
            "readiness_summary": "Direct demand on metro rail, highway bridges, and commercial infrastructure construction projects (L&T, Shapoorji)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Civil Reinforcement Sub-Contracting Team",
            "potential_monthly_income": "₹35,000 - ₹90,000 / month",
            "required_resources": ["bar bending bench", "cutting machine", "binding wire hook", "safety boots"],
            "readiness_summary": "High daily piece-rate earnings across residential house construction sites."
        }
    },

    # -------------------------------------------------------------------------
    # 25. CONSTRUCTION - CONSTRUCTION PAINTER & DECORATOR (CSDCI)
    # -------------------------------------------------------------------------
    {
        "qp_code": "CON/Q0501",
        "qualification_name": "Construction Painter & Decorator",
        "nsqf_level": "Level 3",
        "sector": "Construction",
        "council": "Construction Skill Development Council of India (CSDCI)",
        "min_education": "5th Standard",
        "preferred_education": "8th Standard",
        "min_experience_years": 0.0,
        "training_duration_hours": 300,
        "official_scheme": "PMKVY 4.0 / PM Vishwakarma",
        "description": "Prepares wall surfaces, applies primer, putty, emulsions, enamels, and textured finishes for interior and exterior buildings.",
        "required_skills": [
            "Wall Surface Preparation & Putty Application",
            "Spray & Roller Emulsion Painting",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "CON/N0501",
                "title": "Scrape, patch, sand, and apply primer/putty base coats on plastered masonry walls",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Wall Surface Preparation & Putty Application"]
            },
            {
                "nos_code": "CON/N0502",
                "title": "Apply uniform interior/exterior acrylic emulsions and decorative texture patterns",
                "urgency": "Medium",
                "criticality": "Core Technical",
                "related_skills": ["Spray & Roller Emulsion Painting"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Commercial Painter", "Coating Applicator"],
            "potential_monthly_income": "₹16,000 - ₹28,000 / month",
            "readiness_summary": "Placement with painting contractors and authorized brand applicators (Asian Paints, Berger)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Independent House Painting & Texture Decorating Service",
            "potential_monthly_income": "₹30,000 - ₹75,000 / month",
            "required_resources": ["paint rollers", "putty knives", "airless spray gun", "aluminum ladder"],
            "readiness_summary": "High seasonal demand during festivals, marriages, and new house construction."
        }
    },

    # -------------------------------------------------------------------------
    # 26. HEALTHCARE - HOME HEALTH AIDE (HSSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "HSS/Q5102",
        "qualification_name": "Home Health Aide",
        "nsqf_level": "Level 4",
        "sector": "Healthcare",
        "council": "Healthcare Sector Skill Council (HSSC)",
        "min_education": "10th Standard",
        "preferred_education": "12th Standard",
        "min_experience_years": 0.0,
        "training_duration_hours": 360,
        "official_scheme": "PMKVY 4.0 / National Health Mission",
        "description": "Provides dedicated in-home compassionate care, mobility assistance, medication dispensing, and vital monitoring for elderly or bedridden patients.",
        "required_skills": [
            "Patient Vitals Monitoring & Bedside Care",
            "Elderly Mobility Assistance & Hygiene Management",
            "Customer Communication & Consultation"
        ],
        "competencies": [
            {
                "nos_code": "HSS/N5103",
                "title": "Monitor patient pulse, blood pressure, glucose levels, and maintain clinical home logs",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Patient Vitals Monitoring & Bedside Care"]
            },
            {
                "nos_code": "HSS/N5104",
                "title": "Assist patients with sponge bathing, position changes, feeding, and prescribed oral medications",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Elderly Mobility Assistance & Hygiene Management"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Home Health Caregiver", "Geriatric Care Assistant"],
            "potential_monthly_income": "₹18,000 - ₹32,000 / month",
            "readiness_summary": "Huge demand across urban healthcare providers (Portea, Apollo Homecare, Medwell)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Independent Specialized Geriatric & Post-Operative Care Attendant",
            "potential_monthly_income": "₹25,000 - ₹50,000 / month",
            "required_resources": ["digital BP monitor", "glucometer", "pulse oximeter", "first aid kit"],
            "readiness_summary": "Flexible working arrangements with direct weekly/monthly remuneration from client families."
        }
    },

    # -------------------------------------------------------------------------
    # 27. BEAUTY & WELLNESS - HAIR STYLIST (B&WSSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "BWS/Q0202",
        "qualification_name": "Hair Stylist",
        "nsqf_level": "Level 4",
        "sector": "Beauty & Wellness",
        "council": "Beauty & Wellness Sector Skill Council (B&WSSC)",
        "min_education": "8th Standard",
        "preferred_education": "10th Standard",
        "min_experience_years": 0.5,
        "training_duration_hours": 350,
        "official_scheme": "PMKVY 4.0 / PM Vishwakarma",
        "description": "Performs specialized haircuts, shampooing, scalp treatments, blow-drying, hair styling, coloring, and chemical smoothening.",
        "required_skills": [
            "Facial Treatments, Skin Care & Bleaching",
            "Precision Hair Cutting & Styling",
            "Customer Communication & Consultation"
        ],
        "competencies": [
            {
                "nos_code": "BWS/N0202",
                "title": "Consult client on hair morphology, perform precision scissor and trimmer haircuts",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Precision Hair Cutting & Styling"]
            },
            {
                "nos_code": "BWS/N0203",
                "title": "Apply hair color formulation, root touch-up, and chemical keratin smoothening safely",
                "urgency": "Medium",
                "criticality": "Core Technical",
                "related_skills": ["Precision Hair Cutting & Styling"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Senior Hair Stylist", "Salon Technician"],
            "potential_monthly_income": "₹18,000 - ₹38,000 / month",
            "readiness_summary": "Placement in branded salon chains (Naturals, Green Trends, Jawed Habib)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Unisex Hair Salon / Mobile Bridal & Event Styling Service",
            "potential_monthly_income": "₹30,000 - ₹85,000 / month",
            "required_resources": ["pro styling shears", "hair dryer & straightener", "clipper set", "styling chair"],
            "readiness_summary": "Qualifies for PM Vishwakarma ₹15,000 toolkit voucher and collateral-free loan."
        }
    },

    # -------------------------------------------------------------------------
    # 28. LOGISTICS - WAREHOUSE ASSOCIATE (LSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "LSC/Q2101",
        "qualification_name": "Warehouse Associate / Inventory Clerk",
        "nsqf_level": "Level 3",
        "sector": "Logistics & Supply Chain",
        "council": "Logistics Sector Skill Council (LSC)",
        "min_education": "10th Standard",
        "preferred_education": "12th Standard",
        "min_experience_years": 0.0,
        "training_duration_hours": 280,
        "official_scheme": "PMKVY 4.0 / NAPS Apprenticeship",
        "description": "Receives inwards freight, sorts inventory, handles handheld barcode scanners, pallet jacks, and manages stock bin locations.",
        "required_skills": [
            "Data Entry & Office Spreadsheet Documentation",
            "Barcode Scanning & Inventory Binning",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "LSC/N2101",
                "title": "Unload cargo shipments, verify delivery challans, and record items via handheld terminal (HHT)",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Barcode Scanning & Inventory Binning"]
            },
            {
                "nos_code": "LSC/N2102",
                "title": "Pick order batches, pack boxes, and operate manual pallet trucks inside warehouse safely",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Barcode Scanning & Inventory Binning"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Warehouse Associate", "Inventory Executive", "Fulfillment Picker"],
            "potential_monthly_income": "₹16,000 - ₹25,000 / month",
            "readiness_summary": "Immediate hiring across e-commerce fulfillment hubs (Amazon, Flipkart, Delhivery, BlueDart)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Local Micro-Fulfillment & Third-Party Delivery Hub",
            "potential_monthly_income": "₹25,000 - ₹55,000 / month",
            "required_resources": ["storage racks", "barcode scanner", "smartphone", "delivery two wheeler"],
            "readiness_summary": "Tie-ups with quick-commerce platforms (Blinkit, Zepto, Instamart) for localized delivery franchises."
        }
    },

    # -------------------------------------------------------------------------
    # 29. FOOD PROCESSING - BAKING TECHNICIAN (FICSI)
    # -------------------------------------------------------------------------
    {
        "qp_code": "FIC/Q5005",
        "qualification_name": "Baking Technician / Master Baker",
        "nsqf_level": "Level 4",
        "sector": "Food Processing",
        "council": "Food Industry Capacity & Skill Initiative (FICSI)",
        "min_education": "8th Standard",
        "preferred_education": "10th Standard",
        "min_experience_years": 0.5,
        "training_duration_hours": 300,
        "official_scheme": "PMKVY 4.0 / PM Formalisation of Micro food enterprises (PMFME)",
        "description": "Prepares dough, regulates commercial deck and rotary ovens, bakes bread, buns, pastries, biscuits, and enforces FSSAI food hygiene.",
        "required_skills": [
            "Bakery Dough Mixing & Proofing",
            "Commercial Oven Temperature Operation",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "FIC/N5005",
                "title": "Weigh recipe ingredients, operate spiral dough kneaders, and manage yeast fermentation",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Bakery Dough Mixing & Proofing"]
            },
            {
                "nos_code": "FIC/N5006",
                "title": "Bake items in electric/gas rotary rack ovens per precise temperature curves and inspect crust quality",
                "urgency": "High",
                "criticality": "Quality Assurance",
                "related_skills": ["Commercial Oven Temperature Operation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Bakery Chef", "Production Line Operator"],
            "potential_monthly_income": "₹16,000 - ₹28,000 / month",
            "readiness_summary": "Employment in commercial bakeries, hypermarkets, hotel kitchens, and quick service restaurants."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Artisanal Neighborhood Bakery & Custom Cake Studio",
            "potential_monthly_income": "₹30,000 - ₹90,000 / month",
            "required_resources": ["commercial deck oven", "planetary mixer", "baking trays", "refrigerator"],
            "readiness_summary": "Eligible for PMFME 35% capital subsidy (up to ₹10 lakh) and Mudra loans."
        }
    },

    # -------------------------------------------------------------------------
    # 30. HANDICRAFTS - WOODWARE ARTISAN / TRADITIONAL CARPENTER (HCS)
    # -------------------------------------------------------------------------
    {
        "qp_code": "HCS/Q6702",
        "qualification_name": "Woodware Artisan / Traditional Carpenter",
        "nsqf_level": "Level 4",
        "sector": "Handicrafts and Carpet",
        "council": "Handicrafts and Carpet Sector Skill Council (HCSSC)",
        "min_education": "5th Standard",
        "preferred_education": "8th Standard",
        "min_experience_years": 0.5,
        "training_duration_hours": 300,
        "official_scheme": "PM Vishwakarma / PMKVY 4.0 RPL",
        "description": "Carves, shapes, joins, and finishes seasoned timber into traditional furniture, doors, windows, decorative woodware, and toys.",
        "required_skills": [
            "Wood Carving, Planing & Mortise Joining",
            "Furniture Assembly & Lacquer Finishing",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "HCS/N6702",
                "title": "Plane timber, execute mortise-tenon wood joints, and hand-carve floral/traditional relief motifs",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Wood Carving, Planing & Mortise Joining"]
            },
            {
                "nos_code": "HCS/N6703",
                "title": "Sand, stain, and apply PU varnish/shellac polish coats for long-lasting weather-resistant finish",
                "urgency": "Medium",
                "criticality": "Quality Assurance",
                "related_skills": ["Furniture Assembly & Lacquer Finishing"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Master Carpenter", "Woodcraft Finishing Specialist"],
            "potential_monthly_income": "₹18,000 - ₹32,000 / month",
            "readiness_summary": "Direct demand in modular kitchen manufacturing, export handicraft units, and interior contracting."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Custom Wooden Furniture & Interior Woodcraft Workshop",
            "potential_monthly_income": "₹35,000 - ₹95,000 / month",
            "required_resources": ["electric wood planer", "circular saw", "chisels set", "router tool"],
            "readiness_summary": "Top tier beneficiary under PM Vishwakarma with ₹15,000 tool kit voucher and 5% credit."
        }
    },

    # -------------------------------------------------------------------------
    # 31. RETAIL - RETAIL SALES ASSOCIATE (RASCI)
    # -------------------------------------------------------------------------
    {
        "qp_code": "RAS/Q0104",
        "qualification_name": "Retail Sales Associate",
        "nsqf_level": "Level 4",
        "sector": "Retail",
        "council": "Retailers Association's Skill Council of India (RASCI)",
        "min_education": "10th Standard",
        "preferred_education": "12th Standard",
        "min_experience_years": 0.0,
        "training_duration_hours": 280,
        "official_scheme": "PMKVY 4.0 / NAPS Apprenticeship",
        "description": "Welcomes customers in retail stores, demonstrates merchandise, manages shelf visual merchandising, and operates POS billing tills.",
        "required_skills": [
            "Customer Communication & Consultation",
            "Digital Payments & UPI Transactions",
            "Data Entry & Office Spreadsheet Documentation"
        ],
        "competencies": [
            {
                "nos_code": "RAS/N0104",
                "title": "Engage retail shoppers, identify requirements, and cross-sell complementary merchandise",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Customer Communication & Consultation"]
            },
            {
                "nos_code": "RAS/N0105",
                "title": "Process barcode billing on POS software and accept cards/UPI digital payments",
                "urgency": "High",
                "criticality": "Digital Literacy",
                "related_skills": ["Digital Payments & UPI Transactions"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Retail Sales Executive", "Store Cashier", "Floor Associate"],
            "potential_monthly_income": "₹15,000 - ₹24,000 / month",
            "readiness_summary": "Direct placement in supermarket chains (Reliance Retail, D-Mart, Trent, Croma)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Neighborhood Kirana / Retail Outlet with Digital POS",
            "potential_monthly_income": "₹25,000 - ₹60,000 / month",
            "required_resources": ["display racks", "smartphone / POS terminal", "inventory capital"],
            "readiness_summary": "Modern retail practices boost store profitability and turnover."
        }
    },

    # -------------------------------------------------------------------------
    # 32. IT-ITeS - JUNIOR SOFTWARE DEVELOPER (NASSCOM)
    # -------------------------------------------------------------------------
    {
        "qp_code": "SSC/Q0501",
        "qualification_name": "Junior Software Developer",
        "nsqf_level": "Level 5",
        "sector": "IT-ITeS",
        "council": "IT-ITeS Sector Skill Council (NASSCOM)",
        "min_education": "12th Standard",
        "preferred_education": "Graduate Degree or Polytechnic Diploma",
        "min_experience_years": 0.0,
        "training_duration_hours": 400,
        "official_scheme": "PMKVY 4.0 / FutureSkills Prime",
        "description": "Writes code, develops web or backend modules, executes unit test cases, and fixes software bugs using modern programming languages.",
        "required_skills": [
            "Data Entry & Office Spreadsheet Documentation",
            "Customer Communication & Consultation"
        ],
        "competencies": [
            {
                "nos_code": "SSC/N0501",
                "title": "Write maintainable application code in Python/JavaScript based on software specs",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Data Entry & Office Spreadsheet Documentation"]
            },
            {
                "nos_code": "SSC/N0502",
                "title": "Execute unit testing, log defects in issue trackers, and perform version control using Git",
                "urgency": "Medium",
                "criticality": "Quality Assurance",
                "related_skills": ["Data Entry & Office Spreadsheet Documentation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Junior Software Engineer", "Web Developer Intern", "QA Associate"],
            "potential_monthly_income": "₹22,000 - ₹45,000 / month",
            "readiness_summary": "High hiring demand across tech services firms (TCS, Infosys, Zoho, tech startups)."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Freelance Web Development & Digital Solutions Studio",
            "potential_monthly_income": "₹30,000 - ₹80,000 / month",
            "required_resources": ["laptop / PC", "internet connection", "smartphone"],
            "readiness_summary": "Low overhead business providing digital transformation services to local MSMEs."
        }
    }
"""

EXTRA_OCCUPATION_MAPPINGS = """
    "organic": ["AGR/Q1202"],
    "dairy": ["AGR/Q4101", "FIC/Q2001"],
    "cattle": ["AGR/Q4101"],
    "milk": ["AGR/Q4101", "FIC/Q2001"],
    "cow": ["AGR/Q4101"],
    "auto electrician": ["ASC/Q1402", "ASC/Q1901"],
    "battery": ["ASC/Q1402", "ASC/Q1901"],
    "rebar": ["CON/Q0203"],
    "steel fixer": ["CON/Q0203"],
    "bar bender": ["CON/Q0203"],
    "painter": ["CON/Q0501"],
    "painting": ["CON/Q0501"],
    "home health": ["HSS/Q5102", "HSS/Q5101"],
    "elderly care": ["HSS/Q5102"],
    "attendant": ["HSS/Q5102", "HSS/Q5101"],
    "hair": ["BWS/Q0202", "BWS/Q0102"],
    "haircut": ["BWS/Q0202"],
    "barber": ["BWS/Q0202"],
    "warehouse": ["LSC/Q2101", "LSC/Q3023"],
    "inventory": ["LSC/Q2101"],
    "delivery": ["LSC/Q3023"],
    "courier": ["LSC/Q3023"],
    "baker": ["FIC/Q5005"],
    "bakery": ["FIC/Q5005"],
    "bread": ["FIC/Q5005"],
    "cake": ["FIC/Q5005"],
    "carpenter": ["HCS/Q6702"],
    "wood": ["HCS/Q6702"],
    "woodcraft": ["HCS/Q6702"],
    "furniture": ["HCS/Q6702"],
    "retail": ["RAS/Q0104"],
    "sales": ["RAS/Q0104", "SSC/Q0508"],
    "cashier": ["RAS/Q0104"],
    "shop assistant": ["RAS/Q0104"],
    "developer": ["SSC/Q0501"],
    "programmer": ["SSC/Q0501"],
    "coding": ["SSC/Q0501"],
    "software": ["SSC/Q0501"],
"""

def update_catalog():
    filepath = r"c:\SIH\backend\app\knowledge\nsqf_catalog.py"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Insert new QPs before closing `]` of NSQF_QUALIFICATION_PACKS
    split_target = "NSQF_QUALIFICATION_PACKS: List[Dict[str, Any]] = ["
    if split_target not in content:
        print("Could not find NSQF_QUALIFICATION_PACKS definition")
        return False

    # Find the closing bracket of the list
    # Look for "OCCUPATION_DOMAIN_MAP" which comes right after the list
    occ_idx = content.find("OCCUPATION_DOMAIN_MAP: Dict[str, List[str]] = {")
    if occ_idx == -1:
        print("Could not find OCCUPATION_DOMAIN_MAP")
        return False

    # Find the bracket ']' right before occ_idx
    bracket_idx = content.rfind("]", 0, occ_idx)
    if bracket_idx == -1:
        print("Could not find closing bracket for NSQF_QUALIFICATION_PACKS")
        return False

    # Insert new QPs
    updated_content = content[:bracket_idx].rstrip() + ",\n" + NEW_QPS + "\n]\n\n"

    # Now add EXTRA_OCCUPATION_MAPPINGS into OCCUPATION_DOMAIN_MAP
    occ_open_idx = updated_content.find("OCCUPATION_DOMAIN_MAP: Dict[str, List[str]] = {")
    if occ_open_idx != -1:
        insert_pt = occ_open_idx + len("OCCUPATION_DOMAIN_MAP: Dict[str, List[str]] = {")
        updated_content = updated_content[:insert_pt] + "\n" + EXTRA_OCCUPATION_MAPPINGS + updated_content[insert_pt:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated_content)

    print("Successfully updated nsqf_catalog.py with additional verified NSQF packs!")
    return True

if __name__ == "__main__":
    update_catalog()
