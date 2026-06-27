# Centroid coordinates for all 64 districts in Bangladesh
# Sourced from official geocodes and DC office locations

DISTRICT_COORDINATES = {
    # Dhaka Division
    "Dhaka": {"lat": 23.8103, "lon": 90.4125, "division": "Dhaka"},
    "Gazipur": {"lat": 24.0023, "lon": 90.4264, "division": "Dhaka"},
    "Manikganj": {"lat": 23.8644, "lon": 90.0047, "division": "Dhaka"},
    "Munshiganj": {"lat": 23.5435, "lon": 90.5354, "division": "Dhaka"},
    "Narayanganj": {"lat": 23.6238, "lon": 90.5000, "division": "Dhaka"},
    "Narsingdi": {"lat": 23.9229, "lon": 90.7177, "division": "Dhaka"},
    "Faridpur": {"lat": 23.6071, "lon": 89.8429, "division": "Dhaka"},
    "Gopalganj": {"lat": 23.0071, "lon": 89.8273, "division": "Dhaka"},
    "Madaripur": {"lat": 23.1648, "lon": 90.1896, "division": "Dhaka"},
    "Rajbari": {"lat": 23.7574, "lon": 89.6444, "division": "Dhaka"},
    "Shariatpur": {"lat": 23.2423, "lon": 90.3536, "division": "Dhaka"},
    "Kishoreganj": {"lat": 24.4349, "lon": 90.7812, "division": "Dhaka"},
    "Tangail": {"lat": 24.2513, "lon": 89.9167, "division": "Dhaka"},

    # Mymensingh Division
    "Mymensingh": {"lat": 24.7471, "lon": 90.4203, "division": "Mymensingh"},
    "Jamalpur": {"lat": 24.9375, "lon": 89.9377, "division": "Mymensingh"},
    "Netrokona": {"lat": 24.8700, "lon": 90.7200, "division": "Mymensingh"},
    "Sherpur": {"lat": 25.0189, "lon": 90.0175, "division": "Mymensingh"},

    # Chattogram Division
    "Chattogram": {"lat": 22.3569, "lon": 91.7832, "division": "Chattogram"},
    "Cox's Bazar": {"lat": 21.4272, "lon": 92.0058, "division": "Chattogram"},
    "Bandarban": {"lat": 22.1953, "lon": 92.2184, "division": "Chattogram"},
    "Rangamati": {"lat": 22.7324, "lon": 92.2438, "division": "Chattogram"},
    "Khagrachhari": {"lat": 23.1192, "lon": 91.9846, "division": "Chattogram"},
    "Cumilla": {"lat": 23.4682, "lon": 91.1785, "division": "Chattogram"},
    "Feni": {"lat": 23.0116, "lon": 91.3963, "division": "Chattogram"},
    "Brahmanbaria": {"lat": 23.9574, "lon": 91.1119, "division": "Chattogram"},
    "Noakhali": {"lat": 22.8698, "lon": 91.0968, "division": "Chattogram"},
    "Lakshmipur": {"lat": 22.9426, "lon": 90.8417, "division": "Chattogram"},
    "Chandpur": {"lat": 23.2321, "lon": 90.6631, "division": "Chattogram"},

    # Sylhet Division
    "Sylhet": {"lat": 24.8949, "lon": 91.8687, "division": "Sylhet"},
    "Sunamganj": {"lat": 25.0658, "lon": 91.3950, "division": "Sylhet"},
    "Habiganj": {"lat": 24.3749, "lon": 91.4124, "division": "Sylhet"},
    "Moulvibazar": {"lat": 24.4829, "lon": 91.7685, "division": "Sylhet"},

    # Rajshahi Division
    "Rajshahi": {"lat": 24.3745, "lon": 88.6042, "division": "Rajshahi"},
    "Naogaon": {"lat": 24.7936, "lon": 88.9318, "division": "Rajshahi"},
    "Natore": {"lat": 24.4200, "lon": 89.0200, "division": "Rajshahi"},
    "Chapainawabganj": {"lat": 24.5965, "lon": 88.2775, "division": "Rajshahi"},
    "Pabna": {"lat": 24.0040, "lon": 89.2444, "division": "Rajshahi"},
    "Sirajganj": {"lat": 24.4577, "lon": 89.7080, "division": "Rajshahi"},
    "Bogura": {"lat": 24.8481, "lon": 89.3730, "division": "Rajshahi"},
    "Joypurhat": {"lat": 25.0947, "lon": 89.0224, "division": "Rajshahi"},

    # Rangpur Division
    "Rangpur": {"lat": 25.7558, "lon": 89.2444, "division": "Rangpur"},
    "Dinajpur": {"lat": 25.6217, "lon": 88.6470, "division": "Rangpur"},
    "Panchagarh": {"lat": 26.3340, "lon": 88.5583, "division": "Rangpur"},
    "Thakurgaon": {"lat": 26.0333, "lon": 88.4667, "division": "Rangpur"},
    "Gaibandha": {"lat": 25.3287, "lon": 89.5422, "division": "Rangpur"},
    "Kurigram": {"lat": 25.8054, "lon": 89.7547, "division": "Rangpur"},
    "Lalmonirhat": {"lat": 25.9142, "lon": 89.4428, "division": "Rangpur"},
    "Nilphamari": {"lat": 25.9317, "lon": 88.8560, "division": "Rangpur"},

    # Khulna Division
    "Jashore": {"lat": 23.1664, "lon": 89.2081, "division": "Khulna"},
    "Jhenaidah": {"lat": 23.5450, "lon": 89.1536, "division": "Khulna"},
    "Magura": {"lat": 23.4873, "lon": 89.4199, "division": "Khulna"},
    "Narail": {"lat": 23.1725, "lon": 89.5126, "division": "Khulna"},
    "Khulna": {"lat": 22.8456, "lon": 89.5403, "division": "Khulna"},
    "Bagerhat": {"lat": 22.6516, "lon": 89.7859, "division": "Khulna"},
    "Satkhira": {"lat": 22.7185, "lon": 89.0706, "division": "Khulna"},
    "Kushtia": {"lat": 23.9013, "lon": 89.1204, "division": "Khulna"},
    "Chuadanga": {"lat": 23.6401, "lon": 88.8418, "division": "Khulna"},
    "Meherpur": {"lat": 23.7622, "lon": 88.6318, "division": "Khulna"},

    # Barishal Division
    "Barishal": {"lat": 22.7010, "lon": 90.3535, "division": "Barishal"},
    "Bhola": {"lat": 22.6875, "lon": 90.6441, "division": "Barishal"},
    "Jhalokati": {"lat": 22.6406, "lon": 90.1989, "division": "Barishal"},
    "Pirojpur": {"lat": 22.5791, "lon": 89.9753, "division": "Barishal"},
    "Barguna": {"lat": 22.1591, "lon": 90.1255, "division": "Barishal"},
    "Patuakhali": {"lat": 22.3536, "lon": 90.3349, "division": "Barishal"}
}
