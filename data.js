// =========================================
// CIVICWORLD FACILITY DATABASE
// =========================================

const facilityData = [

    {
        id: "hospital",
        name: "City Care Hospital",
        type: "Hospital",
        area: "Hospital Area",
        icon: "🏥",
        description: "A demo public healthcare facility in the locality.",
        timings: "Open 24 hours",
        services: [
            "Emergency Services",
            "General Medicine",
            "Pharmacy",
            "Ambulance"
        ],
        accessibility: "Accessible entrance",
    },

    {
        id: "park",
        name: "Green Valley Park",
        type: "Park",
        area: "Park Area",
        icon: "🌳",
        description: "A public green space for walking, recreation and community activities.",
        timings: "6:00 AM – 8:00 PM",
        services: [
            "Walking Area",
            "Children's Area",
            "Open Space",
            "Seating"
        ],
        accessibility: "Accessible walking area",
    },

    {
        id: "school",
        name: "City Public School",
        type: "School",
        area: "School Area",
        icon: "🏫",
        description: "A demo educational facility serving the local community.",
        timings: "8:00 AM – 3:00 PM",
        services: [
            "Primary Education",
            "Secondary Education",
            "Library",
            "Sports Area"
        ],
        accessibility: "Accessible entrance",
    },

    {
        id: "post-office",
        name: "Local Post Office",
        type: "Public Service",
        area: "Post Office Area",
        icon: "📮",
        description: "A demo public service facility for postal and related services.",
        timings: "9:00 AM – 5:00 PM",
        services: [
            "Postal Services",
            "Parcel Services",
            "Registered Post",
            "Basic Citizen Services"
        ],
       accessibility: "Accessible entrance", 
    },

    {
        id: "bus-stop",
        name: "Central Bus Stop",
        type: "Transport",
        area: "Bus Stop Area",
        icon: "🚌",
        description: "A demo public transport point in the locality.",
        timings: "6:00 AM – 10:00 PM",
        services: [
            "Local Bus Routes",
            "Passenger Waiting Area",
            "Public Transport Access"
        ],
        accessibility: "Accessible waiting area",
    },

    {
        id: "home",
        name: "My Home",
        type: "Private",
        area: "My Home Area",
        icon: "🏠",
        description: "Your private home marker. Exact address is not displayed.",
        timings: "Private",
        services: [
            "Private Location"
        ],
        accessibility: "Private"
    }

];