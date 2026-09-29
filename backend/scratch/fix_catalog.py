filepath = r"c:\SIH\backend\app\knowledge\nsqf_catalog.py"

OCCUPATION_CODE = '''
# Explicit Prior Occupation to QP/Sector Mapping Table
OCCUPATION_DOMAIN_MAP: Dict[str, List[str]] = {
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
    "tailor": ["AMH/Q1947", "AMH/Q0102", "AMH/Q1001"],
    "tailoring": ["AMH/Q1947", "AMH/Q0102", "AMH/Q1001"],
    "stitching": ["AMH/Q1947", "AMH/Q0102"],
    "dressmaker": ["AMH/Q1947", "AMH/Q0102"],
    "embroidery": ["AMH/Q1001", "AMH/Q1947"],
    "electrician": ["ELE/Q6001", "SGJ/Q0101"],
    "wireman": ["ELE/Q6001"],
    "wiring": ["ELE/Q6001"],
    "solar": ["SGJ/Q0101", "SGJ/Q0102"],
    "suryamitra": ["SGJ/Q0101"],
    "mechanic": ["ASC/Q1411", "ASC/Q1901"],
    "bike": ["ASC/Q1411", "ASC/Q1901"],
    "two wheeler": ["ASC/Q1411"],
    "ev": ["ASC/Q1901"],
    "electric vehicle": ["ASC/Q1901"],
    "data entry": ["SSC/Q0110", "SSC/Q0508", "SSC/Q2212"],
    "crm": ["SSC/Q0508"],
    "office": ["SSC/Q0110", "SSC/Q0508", "SSC/Q2212"],
    "computer": ["SSC/Q0110", "ELE/Q3102", "SSC/Q0508", "SSC/Q0501"],
    "hardware": ["ELE/Q3102", "ELE/Q1201", "ELE/Q4601"],
    "mobile": ["ELE/Q1201", "ELE/Q8104"],
    "phone": ["ELE/Q1201", "ELE/Q8104"],
    "plumber": ["PSC/Q0104", "PSC/Q0105"],
    "plumbing": ["PSC/Q0104", "PSC/Q0105", "AGR/Q1201"],
    "pipe": ["PSC/Q0104", "PSC/Q0105"],
    "mason": ["CON/Q0102", "CON/Q0203"],
    "construction": ["CON/Q0102", "CON/Q0203", "CON/Q0501"],
    "building": ["CON/Q0102"],
    "nurse": ["HSS/Q5101", "HSS/Q5102"],
    "hospital": ["HSS/Q5101", "HSS/Q5102"],
    "patient": ["HSS/Q5101", "HSS/Q5102"],
    "caregiver": ["HSS/Q5101", "HSS/Q5102"],
    "gda": ["HSS/Q5101"],
    "beauty": ["BWS/Q0102", "BWS/Q0202"],
    "parlour": ["BWS/Q0102", "BWS/Q0202"],
    "makeup": ["BWS/Q0102"],
    "salon": ["BWS/Q0102", "BWS/Q0202"],
    "farming": ["AGR/Q1201", "AGR/Q1202", "AGR/Q4101"],
    "agriculture": ["AGR/Q1201", "AGR/Q1202", "AGR/Q4101"],
    "irrigation": ["AGR/Q1201"]
}


def get_all_nsqf_qualifications() -> List[Dict[str, Any]]:
    """Return verified NSQF qualification pack registry."""
    return NSQF_QUALIFICATION_PACKS


def get_nsqf_qualification_by_code(qp_code: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve verified QP details by exact Qualification Pack code.
    Guaranteed safe against casing and whitespace. Returns None on miss.
    """
    if not qp_code:
        return None
    code_clean = qp_code.strip().upper()
    for qp in NSQF_QUALIFICATION_PACKS:
        if qp["qp_code"].upper() == code_clean:
            return qp
    return None
'''

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

if "get_all_nsqf_qualifications" not in text:
    text = text.rstrip() + "\n\n" + OCCUPATION_CODE + "\n"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text)
    print("Appended lookup functions and domain map to nsqf_catalog.py")
else:
    print("Functions already present")
