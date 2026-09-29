import sys

MORE_QPS = """
    # -------------------------------------------------------------------------
    # 33. PLUMBING - PIPE FITTER (IPSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "PSC/Q0105",
        "qualification_name": "Pipe Fitter",
        "nsqf_level": "Level 4",
        "sector": "Plumbing",
        "council": "Indian Plumbing Skills Council (IPSC)",
        "min_education": "8th Standard",
        "preferred_education": "10th Standard or ITI",
        "min_experience_years": 0.5,
        "training_duration_hours": 350,
        "official_scheme": "PMKVY 4.0 / Jal Jeevan Mission",
        "description": "Cuts, threads, bends, and joins industrial GI, HDPE, and MS pipes for water supply, firefighting, and industrial fluid transmission.",
        "required_skills": [
            "Plumbing Pipe Fitting & Sanitary Installation",
            "Multimeter Testing & Fault Diagnosis",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "PSC/N0107",
                "title": "Cut, bevel, thread, and assemble heavy GI and composite pipelines per isometric plumbing drawings",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Plumbing Pipe Fitting & Sanitary Installation"]
            },
            {
                "nos_code": "PSC/N0108",
                "title": "Perform hydrostatic pressure testing and verify joint leak tightness in piping systems",
                "urgency": "High",
                "criticality": "Quality Assurance",
                "related_skills": ["Plumbing Pipe Fitting & Sanitary Installation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Industrial Pipe Fitter", "Firefighting Pipeline Technician"],
            "potential_monthly_income": "₹18,000 - ₹32,000 / month",
            "readiness_summary": "High domestic and Gulf overseas demand in high-rise buildings and Jal Jeevan Mission contractors."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Commercial Pipe Fitting & High-Pressure Plumbing Contractor",
            "potential_monthly_income": "₹32,000 - ₹80,000 / month",
            "required_resources": ["pipe threader machine", "pipe cutter", "pressure testing pump"],
            "readiness_summary": "Lucrative sub-contracting for commercial complexes and apartment projects."
        }
    },

    # -------------------------------------------------------------------------
    # 34. HEALTHCARE - EMERGENCY MEDICAL TECHNICIAN (HSSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "HSS/Q2301",
        "qualification_name": "Emergency Medical Technician - Basic",
        "nsqf_level": "Level 5",
        "sector": "Healthcare",
        "council": "Healthcare Sector Skill Council (HSSC)",
        "min_education": "12th Standard",
        "preferred_education": "B.Sc or GNM Nursing",
        "min_experience_years": 0.5,
        "training_duration_hours": 400,
        "official_scheme": "PMKVY 4.0 / National Health Mission (108 Ambulance)",
        "description": "Delivers pre-hospital emergency trauma care, basic life support (BLS), CPR, oxygen therapy, and emergency patient transport.",
        "required_skills": [
            "Patient Vitals Monitoring & Bedside Care",
            "Workplace Safety & Hazard Protection",
            "Customer Communication & Consultation"
        ],
        "competencies": [
            {
                "nos_code": "HSS/N2301",
                "title": "Provide cardiopulmonary resuscitation (CPR) and manage automated external defibrillator (AED)",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Patient Vitals Monitoring & Bedside Care"]
            },
            {
                "nos_code": "HSS/N2302",
                "title": "Immobilize cervical spine, control severe bleeding, and stabilize fractures during ambulance transit",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Patient Vitals Monitoring & Bedside Care"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Ambulance EMT", "Hospital Trauma Technician", "Industrial First Aid Officer"],
            "potential_monthly_income": "₹20,000 - ₹35,000 / month",
            "readiness_summary": "Direct recruitment into 108 Emergency Ambulance fleet and multispecialty trauma centers."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Private Patient Transport & Medical Event Coverage Agency",
            "potential_monthly_income": "₹35,000 - ₹75,000 / month",
            "required_resources": ["ambulance vehicle", "stretcher", "oxygen cylinder kit", "BLS kit"],
            "readiness_summary": "High commercial demand for sports events, marathons, and industrial construction sites."
        }
    },

    # -------------------------------------------------------------------------
    # 35. LOGISTICS - COURIER DELIVERY EXECUTIVE (LSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "LSC/Q3023",
        "qualification_name": "Courier Delivery Executive",
        "nsqf_level": "Level 3",
        "sector": "Logistics & Supply Chain",
        "council": "Logistics Sector Skill Council (LSC)",
        "min_education": "10th Standard",
        "preferred_education": "10th or 12th Standard",
        "min_experience_years": 0.0,
        "training_duration_hours": 200,
        "official_scheme": "PMKVY 4.0 / Skill India Digital",
        "description": "Performs last-mile parcel deliveries, routes optimization via mobile app, verifies OTP/signatures, and collects COD digital payments.",
        "required_skills": [
            "Digital Payments & UPI Transactions",
            "Customer Communication & Consultation",
            "Workplace Safety & Hazard Protection"
        ],
        "competencies": [
            {
                "nos_code": "LSC/N3023",
                "title": "Plan urban delivery route using GPS navigation and inspect package integrity",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Customer Communication & Consultation"]
            },
            {
                "nos_code": "LSC/N3024",
                "title": "Collect cash-on-delivery (COD) via dynamic QR code and record delivery proof in app",
                "urgency": "High",
                "criticality": "Digital Literacy",
                "related_skills": ["Digital Payments & UPI Transactions"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Delivery Executive", "Last Mile Courier Lead"],
            "potential_monthly_income": "₹16,000 - ₹28,000 / month",
            "readiness_summary": "Extensive demand with Zomato, Swiggy, Amazon, Shadowfax, and India Post."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Localized Parcel Pickup & Franchise Courier Delivery Route",
            "potential_monthly_income": "₹28,000 - ₹60,000 / month",
            "required_resources": ["two wheeler", "valid driving license", "smartphone", "delivery backpack"],
            "readiness_summary": "Instant income generation with daily/weekly payout cycles."
        }
    },

    # -------------------------------------------------------------------------
    # 36. TOURISM & HOSPITALITY - FRONT OFFICE ASSOCIATE (THSC)
    # -------------------------------------------------------------------------
    {
        "qp_code": "THC/Q0102",
        "qualification_name": "Front Office Associate",
        "nsqf_level": "Level 4",
        "sector": "Tourism & Hospitality",
        "council": "Tourism and Hospitality Skill Council (THSC)",
        "min_education": "12th Standard",
        "preferred_education": "Graduate Degree in Hospitality or Arts/Commerce",
        "min_experience_years": 0.0,
        "training_duration_hours": 350,
        "official_scheme": "PMKVY 4.0 / Hunar Se Rozgar Tak",
        "description": "Welcomes hotel guests, processes check-ins/check-outs on Property Management Software (PMS), and coordinates guest services.",
        "required_skills": [
            "Customer Communication & Consultation",
            "Data Entry & Office Spreadsheet Documentation",
            "Digital Payments & UPI Transactions"
        ],
        "competencies": [
            {
                "nos_code": "THC/N0102",
                "title": "Manage guest reservations, register guests on PMS, and allot hotel rooms",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Customer Communication & Consultation"]
            },
            {
                "nos_code": "THC/N0103",
                "title": "Prepare guest folios, settle billing through credit cards/UPI, and handle guest complaints politely",
                "urgency": "High",
                "criticality": "Core Technical",
                "related_skills": ["Digital Payments & UPI Transactions", "Customer Communication & Consultation"]
            }
        ],
        "employment_pathways": {
            "type": "Wage Employment",
            "job_roles": ["Front Desk Executive", "Guest Relations Associate", "Receptionist"],
            "potential_monthly_income": "₹16,000 - ₹30,000 / month",
            "readiness_summary": "Hiring across hotels, corporate business parks, resorts, and luxury clinics."
        },
        "self_employment_pathways": {
            "type": "Self-Employment",
            "business_model": "Homestay & Heritage B&B Hospitality Management Enterprise",
            "potential_monthly_income": "₹30,000 - ₹70,000 / month",
            "required_resources": ["homestay property / leased rooms", "smartphone / PC", "linen & amenities"],
            "readiness_summary": "Tourism boom in hill stations and temple towns with direct OTA listings (Airbnb, MakeMyTrip)."
        }
    }
"""

filepath = r"c:\SIH\backend\app\knowledge\nsqf_catalog.py"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

target = "OCCUPATION_DOMAIN_MAP: Dict[str, List[str]] = {"
idx = text.find(target)
if idx != -1:
    bracket_idx = text.rfind("]", 0, idx)
    updated = text[:bracket_idx].rstrip() + ",\n" + MORE_QPS + "\n]\n\n" + text[idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated)
    print("Added 4 more QPs. Total now 33+ QPs.")
else:
    print("Target not found")
