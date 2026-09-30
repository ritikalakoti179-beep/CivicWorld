/* =========================================
   CIVICWORLD
   BASIC WEBSITE FUNCTIONS
========================================= */


function exploreLocality() {

    document
        .getElementById("explore")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function openAssistant() {

    document
        .getElementById("assistant")
        .style.display = "flex";

}


function closeAssistant() {

    document
        .getElementById("assistant")
        .style.display = "none";

}

async function askAI() {

    const input = document.getElementById("aiInput");
    const output = document.getElementById("aiResponse");

    if (!input || !output) return;

    const question = input.value.trim();

    if (question === "") {
        output.innerHTML = "<p>Please enter a civic question.</p>";
        return;
    }

    // Show loading message
    output.innerHTML = `
        <p>🤖 <strong>Civic AI is thinking...</strong></p>
    `;

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: question
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        output.innerHTML = `
            <p>🤖 <strong>Civic AI</strong></p>
            <p>${data.reply}</p>
        `;

    } catch (error) {

        console.error("Civic AI Error:", error);

        output.innerHTML = `
            <p>⚠️ <strong>Civic AI is temporarily unavailable.</strong></p>
            <p>Please make sure the CivicWorld server is running.</p>
        `;

    }

}

function searchFacility() {

    const input = document.getElementById("searchInput");

    if (!input) {
        console.log("Search box not found");
        return;
    }

    const query = input.value.trim().toLowerCase();

    if (query === "") {
        showMessage("Please enter a facility name.");
        return;
    }

    const result = facilityData.find(facility =>
        facility.name.toLowerCase().includes(query) ||
        facility.type.toLowerCase().includes(query)
    );

    if (!result) {
        showMessage("No matching facility found in this demo locality.");
        return;
    }

    showFacilityFromData(result);
}

function showFacilityFromData(facility) {
    closeAssistant();

    const popup = document.getElementById("facilityPopup");

    if (!popup) return;

    document.getElementById("facilityIcon").textContent =
        facility.icon;

    document.getElementById("facilityName").textContent =
        facility.name;

    document.getElementById("facilityInfo").innerHTML =
        `<strong>${facility.type}</strong><br>
        ${facility.description}<br><br>
        <strong>Timings:</strong> ${facility.timings}<br><br>
        <strong>Services:</strong><br>
        ${facility.services.join("<br>")}`;

    popup.style.display = "block";
}


function showMessage(type) {

    alert(
        type +
        " feature selected.\n\n" +
        "This feature will become interactive in the next stage."
    );

}


/* =========================================
   3D LOCALITY
========================================= */


let scene;
let camera;
let renderer;

let cityGroup;

let raycaster;
let mouse;

let clickableObjects = [];

let selectedFacility = null;

function createTree() {

    const group = new THREE.Group();

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.12,
            0.15,
            0.7,
            8
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x6b4a32
        });

    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );

    group.add(trunk);


    const leavesGeometry =
        new THREE.SphereGeometry(
            0.45,
            8,
            8
        );

    const leavesMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4c8a55
        });

    const leaves =
        new THREE.Mesh(
            leavesGeometry,
            leavesMaterial
        );

    leaves.position.y = 0.55;

    group.add(leaves);

    return group;
}

/* -----------------------------------------
   START 3D CITY
----------------------------------------- */


function init3D() {

    const container =
        document.getElementById("city3d");


    if (!container) {
        return;
    }


    /* SCENE */

    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x0b1726);


    /* CAMERA */

    camera =
        new THREE.PerspectiveCamera(
            45,
            container.clientWidth /
            container.clientHeight,
            0.1,
            1000
        );


    camera.position.set(
        8,
        8,
        10
    );


    camera.lookAt(
        0,
        0,
        0
    );


    /* RENDERER */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            1.5
        )
    );


    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );


    container.appendChild(
        renderer.domElement
    );


    /* LIGHTING */

    const ambientLight =
        new THREE.AmbientLight(
            0xffffff,
            1.5
        );

    scene.add(
        ambientLight
    );


    const sunLight =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );


    sunLight.position.set(
        5,
        10,
        5
    );


    scene.add(
        sunLight
    );


    /* CITY GROUP */

    cityGroup =
        new THREE.Group();

    scene.add(
        cityGroup
    );

    createBeautifulEnvironment();
    createLocalityDecoration();

    /* =========================================
   CIVICWORLD TREES + STREET LIGHTS
========================================= */

function createTree(x, y, z, scale = 1) {

    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(
        0.18,
        0.25,
        1.4,
        8
    );

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b
    });

    const trunk = new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
    );

    trunk.position.y = 0.7;

    tree.add(trunk);


    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(
        0.85,
        16,
        16
    );

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x3f8f45
    });

    const leaves = new THREE.Mesh(
        leavesGeometry,
        leavesMaterial
    );

    leaves.position.y = 1.65;

    tree.add(leaves);


    tree.position.set(x, y, z);

    tree.scale.set(
        scale,
        scale,
        scale
    );

    cityGroup.add(tree);

    return tree;
}


/* =========================================
   STREET LIGHT
========================================= */

function createStreetLight(x, y, z) {

    const poleGeometry =
        new THREE.CylinderGeometry(
            0.04,
            0.06,
            2.2,
            8
        );

    const poleMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x334155
        });

    const pole = new THREE.Mesh(
        poleGeometry,
        poleMaterial
    );

    pole.position.set(
        x,
        y + 1.1,
        z
    );

    cityGroup.add(pole);


    const lampGeometry =
        new THREE.SphereGeometry(
            0.16,
            12,
            12
        );

    const lampMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xfff3b0,
            emissive: 0xffd84d,
            emissiveIntensity: 1.5
        });

    const lamp = new THREE.Mesh(
        lampGeometry,
        lampMaterial
    );

    lamp.position.set(
        x,
        y + 2.25,
        z
    );

    cityGroup.add(lamp);
}


/* =========================================
   LOCALITY DECORATION
========================================= */

function createTree(x, y, z, scale = 1) {

    const tree = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(
        0.18,
        0.25,
        1.4,
        8
    );

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b
    });

    const trunk = new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
    );

    trunk.position.y = 0.7;

    tree.add(trunk);

    const leavesGeometry = new THREE.SphereGeometry(
        0.85,
        16,
        16
    );

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x3f8f45
    });

    const leaves = new THREE.Mesh(
        leavesGeometry,
        leavesMaterial
    );

    leaves.position.y = 1.65;

    tree.add(leaves);

    tree.position.set(x, y, z);

    tree.scale.set(
        scale,
        scale,
        scale
    );

    cityGroup.add(tree);

    return tree;
}

function createLocalityDecoration() {

    // Trees
    createTree(-8, 0, -7, 1.2);
    createTree(-12, 0, -4, 0.9);
    createTree(7, 0, -7, 1.1);
    createTree(11, 0, -3, 0.9);
    createTree(-7, 0, 6, 1);
    createTree(8, 0, 6, 1.2);
    createTree(13, 0, 8, 0.8);
    createTree(-13, 0, 8, 1);


    // Street lights
    createStreetLight(-5, 0, -1);
    createStreetLight(4, 0, -1);
    createStreetLight(-5, 0, 5);
    createStreetLight(5, 0, 5);
}

    /* GROUND */

    createGround();


    /* ROADS */

   createRoad(
     0,
    0.03,
    14,
   1.2,
    
);

 createRoad(
    0,
    0.04,
    1.2,
   14,
    
);


    /* FACILITIES */

    createHospital(
        -4,
        0.8,
        -3
    );


    createPark(
        3,
        0.15,
        -3
    );


    createSchool(
        3.5,
        0.8,
        3
    );


    createPostOffice(
        -3.5,
        0.7,
        3
    );


    createBusStop(
        0,
        0.4,
        4.5
    );


    createHome(
        0,
        0.8,
        0
    );


    /* RAYCASTER */

    raycaster =
        new THREE.Raycaster();

    mouse =
        new THREE.Vector2();


    renderer.domElement.addEventListener(
        "click",
        onMapClick
    );


    /* DRAG ROTATION */

    let dragging = false;
    let previousX = 0;


    renderer.domElement.addEventListener(
        "mousedown",
        function(event) {

            dragging = true;

            previousX =
                event.clientX;

        }
    );


    window.addEventListener(
        "mouseup",
        function() {

            dragging = false;

        }
    );


    renderer.domElement.addEventListener(
        "mousemove",
        function(event) {

            if (!dragging) {
                return;
            }


            const difference =
                event.clientX -
                previousX;


            cityGroup.rotation.y +=
                difference * 0.008;


            previousX =
                event.clientX;

        }
    );


    /* ZOOM */

    renderer.domElement.addEventListener(
        "wheel",
        function(event) {

            event.preventDefault();


            camera.position.z +=
                event.deltaY * 0.01;


            camera.position.z =
                Math.max(
                    7,
                    Math.min(
                        16,
                        camera.position.z
                    )
                );

        },
        {
            passive: false
        }
    );


    /* RESIZE */

    window.addEventListener(
        "resize",
        resize3D
    );


    animate3D();

}


/* =========================================
   GROUND
========================================= */


function createGround() {

    const geometry =
        new THREE.BoxGeometry(
            14,
            0.2,
            14
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x18302f
        });


    const ground =
        new THREE.Mesh(
            geometry,
            material
        );


    ground.position.y =
        -0.1;


    cityGroup.add(
        ground
    );

}


/* =========================================
   ROADS
========================================= */


function createRoad(
    x,
    y,
    width,
    depth
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            0.08,
            depth
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x34454d
        });


    const road =
        new THREE.Mesh(
            geometry,
            material
        );


    road.position.set(
        x,
        y,
        0
    );


    cityGroup.add(
        road
    );

}


/* =========================================
   GENERIC BUILDING
========================================= */


function createBuilding(
    x,
    y,
    z,
    width,
    height,
    depth,
    color,
    name,
    info,
    icon
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: color
        });


    const building =
        new THREE.Mesh(
            geometry,
            material
        );


    building.position.set(
        x,
        y,
        z
    );


    building.userData = {

        name: name,

        info: info,

        icon: icon

    };


    cityGroup.add(
        building
    );


    clickableObjects.push(
        building
    );


    return building;

}

/* =========================================
   CIVICWORLD STYLIZED BUILDING
========================================= */

function createStylizedBuilding(
    x,
    y,
    z,
    width,
    height,
    depth,
    color,
    name,
    info,
    icon
) {

    const buildingGroup = new THREE.Group();


    // ==============================
    // MAIN BUILDING
    // ==============================

    const bodyGeometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.65
    });

    const body = new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

    body.position.y = height / 2;

    buildingGroup.add(body);


    // ==============================
    // ROOF
    // ==============================

    const roofGeometry = new THREE.BoxGeometry(
        width + 0.18,
        0.18,
        depth + 0.18
    );

    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.55
    });

    const roof = new THREE.Mesh(
        roofGeometry,
        roofMaterial
    );

    roof.position.y = height + 0.09;

    buildingGroup.add(roof);


    // ==============================
    // FRONT WINDOWS
    // ==============================

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x164e63,
        emissiveIntensity: 0.35,
        roughness: 0.25
    });

    const windowWidth = 0.38;
    const windowHeight = 0.32;

    const windowCount = Math.max(
        2,
        Math.floor(width / 0.7)
    );

    for (let i = 0; i < windowCount; i++) {

        const windowGeometry =
            new THREE.BoxGeometry(
                windowWidth,
                windowHeight,
                0.06
            );

        const windowMesh =
            new THREE.Mesh(
                windowGeometry,
                windowMaterial
            );

        const spacing =
            width / (windowCount + 1);

        windowMesh.position.set(
            -width / 2 + spacing * (i + 1),
            height * 0.65,
            depth / 2 + 0.035
        );

        buildingGroup.add(windowMesh);
    }


    // ==============================
    // ENTRANCE
    // ==============================

    const doorGeometry =
        new THREE.BoxGeometry(
            0.45,
            Math.min(0.8, height * 0.45),
            0.07
        );

    const doorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x172033
        });

    const door =
        new THREE.Mesh(
            doorGeometry,
            doorMaterial
        );

    door.position.set(
        0,
        Math.min(0.4, height * 0.22),
        depth / 2 + 0.045
    );

    buildingGroup.add(door);


    // ==============================
    // SMALL FRONT STEP
    // ==============================

    const stepGeometry =
        new THREE.BoxGeometry(
            0.8,
            0.08,
            0.35
        );

    const stepMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x94a3b8
        });

    const step =
        new THREE.Mesh(
            stepGeometry,
            stepMaterial
        );

    step.position.set(
        0,
        0.04,
        depth / 2 + 0.18
    );

    buildingGroup.add(step);


    // ==============================
    // FACILITY DATA
    // ==============================

    buildingGroup.position.set(
        x,
        y,
        z
    );

    buildingGroup.userData = {
    name: name,
    info: info,
    icon: icon
};

body.userData = {
    name: name,
    info: info,
    icon: icon
};

cityGroup.add(
    buildingGroup
);

clickableObjects.push(
    body
);


    return buildingGroup;
}


/* =========================================
   HOSPITAL
========================================= */


function createHospital(
    x,
    y,
    z
) {

    createStylizedBuilding(
    x,
    y,
    z,
    2.4,
    2.2,
    2.2,
    0x58758c,
    "City Care Hospital",
    "24/7 Emergency • Dermatology • Cardiology",
    "🏥"
);
    
        const doorGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.08);

    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b
    });

    const door = new THREE.Mesh(
        doorGeometry,
        doorMaterial
    );

    door.position.set(
        x,
        y - 0.3,
        z + 1.14
    );

    cityGroup.add(door);

        const windowGeometry = new THREE.BoxGeometry(0.45, 0.35, 0.08);

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        emissive: 0x1e3a5f
    });

    for (let i = -1; i <= 1; i++) {

        const windowMesh = new THREE.Mesh(
            windowGeometry,
            windowMaterial
        );

        windowMesh.position.set(
            x + i * 0.65,
            y + 0.75,
            z + 1.14
        );

        cityGroup.add(windowMesh);
    }
    
        const signGeometry = new THREE.BoxGeometry(1.2, 0.35, 0.08);

    const signMaterial = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x3f1010
    });

    const sign = new THREE.Mesh(
        signGeometry,
        signMaterial
    );

    sign.position.set(
        x,
        y + 1.05,
        z + 1.14
    );

    cityGroup.add(sign);

    const pathGeometry = new THREE.BoxGeometry(0.9, 0.04, 1.2);

const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8
});

const path = new THREE.Mesh(
    pathGeometry,
    pathMaterial
);

path.position.set(
    x,
    0.03,
    z + 1.65
);

cityGroup.add(path);

}

/* =========================================
   CIVICWORLD BEAUTIFUL ENVIRONMENT
========================================= */

function createBeautifulEnvironment() {

    // ---------- SKY ----------
    scene.background = new THREE.Color(0x87ceeb);

    scene.fog = new THREE.Fog(
        0x87ceeb,
        35,
        85
    );


    // ---------- SOFT SUNLIGHT ----------
    const sunLight = new THREE.DirectionalLight(
        0xffffff,
        2.2
    );

    sunLight.position.set(
        15,
        25,
        10
    );

    sunLight.castShadow = true;

    scene.add(sunLight);


    // ---------- SOFT AMBIENT LIGHT ----------
    const ambientLight = new THREE.HemisphereLight(
        0xffffff,
        0x4d7c4f,
        1.5
    );

    scene.add(ambientLight);


    // ---------- CLOUDS ----------
    for (let i = 0; i < 8; i++) {

        const cloud = new THREE.Group();

        for (let j = 0; j < 4; j++) {

            const cloudGeometry =
                new THREE.SphereGeometry(
                    1.2 + Math.random() * 0.7,
                    16,
                    16
                );

            const cloudMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0xffffff
                });

            const cloudPart =
                new THREE.Mesh(
                    cloudGeometry,
                    cloudMaterial
                );

            cloudPart.position.set(
                j * 1.3,
                Math.random() * 0.5,
                Math.random() * 0.4
            );

            cloud.add(cloudPart);
        }

        cloud.position.set(
            -25 + Math.random() * 50,
            15 + Math.random() * 7,
            -25
        );

        cloud.scale.set(
            1.4,
            0.7,
            0.8
        );

        cityGroup.add(cloud);
    }


    // ---------- BACKGROUND HILLS ----------
    for (let i = 0; i < 7; i++) {

        const hillGeometry =
            new THREE.SphereGeometry(
                7 + Math.random() * 4,
                24,
                16
            );

        const hillMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x6fa66b
            });

        const hill =
            new THREE.Mesh(
                hillGeometry,
                hillMaterial
            );

        hill.scale.y = 0.55;

        hill.position.set(
            -30 + i * 10,
            -2,
            -28
        );

        cityGroup.add(hill);
    }


    // ---------- GRASS PATCHES ----------
    for (let i = 0; i < 30; i++) {

        const grassGeometry =
            new THREE.CircleGeometry(
                1.5 + Math.random() * 2,
                16
            );

        const grassMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x4f8f4a
            });

        const grass =
            new THREE.Mesh(
                grassGeometry,
                grassMaterial
            );

        grass.rotation.x = -Math.PI / 2;

        grass.position.set(
            -25 + Math.random() * 50,
            0.02,
            -20 + Math.random() * 25
        );

        cityGroup.add(grass);
    }

}


/* =========================================
   SCHOOL
========================================= */


function createSchool(
    x,
    y,
    z
) {

    createBuilding(

        x,
        y,
        z,

        2.2,
        1.6,
        1.8,

        0x806c52,

        "City Public School",

        "Public school • Accessible entrance",

        "🏫"

    );

    const windowGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.08);

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        emissive: 0x1e3a5f
    });

    for (let i = -1; i <= 1; i++) {

        const schoolWindow = new THREE.Mesh(
            windowGeometry,
            windowMaterial
        );

        schoolWindow.position.set(
            x + i * 0.6,
            y + 0.55,
            z + 0.94
        );

        cityGroup.add(schoolWindow);
    }

        const doorGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.08);

    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b
    });

    const door = new THREE.Mesh(
        doorGeometry,
        doorMaterial
    );

    door.position.set(
        x,
        y - 0.4,
        z + 0.94
    );

    cityGroup.add(door);

    const pathGeometry = new THREE.BoxGeometry(0.8, 0.04, 1.1);

const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8
});

const path = new THREE.Mesh(
    pathGeometry,
    pathMaterial
);

path.position.set(
    x,
    0.03,
    z + 1.45
);

cityGroup.add(path);

}


/* =========================================
   POST OFFICE
========================================= */


function createPostOffice(
    x,
    y,
    z
) {

    createBuilding(

        x,
        y,
        z,

        1.8,
        1.4,
        1.8,

        0x76536d,

        "Local Post Office",

        "Public postal services",

        "🏤"

    );

    const windowGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.08);

const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: 0x1e3a5f
});

for (let i = -1; i <= 1; i++) {

    const postWindow = new THREE.Mesh(
        windowGeometry,
        windowMaterial
    );

    postWindow.position.set(
        x + i * 0.5,
        y + 0.45,
        z + 0.94
    );

    cityGroup.add(postWindow);

    const doorGeometry = new THREE.BoxGeometry(0.45, 0.65, 0.08);

const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b
});

const door = new THREE.Mesh(
    doorGeometry,
    doorMaterial
);

door.position.set(
    x,
    y - 0.25,
    z + 0.94
);

cityGroup.add(door);

const pathGeometry = new THREE.BoxGeometry(0.75, 0.04, 1);

const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8
});

const path = new THREE.Mesh(
    pathGeometry,
    pathMaterial
);

path.position.set(
    x,
    0.03,
    z + 1.45
);

cityGroup.add(path);
}

}


/* =========================================
   PARK
========================================= */


function createPark(
    x,
    y,
    z
) {

    const geometry =
        new THREE.BoxGeometry(
            3,
            0.1,
            2.5
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x35664d
        });


    const park =
        new THREE.Mesh(
            geometry,
            material
        );


    park.position.set(
        x,
        y,
        z
    );


    park.userData = {

        name: "Green Valley Park",

        info: "Walking paths • Green area • Seating",

        icon: "🌳"

    };


    cityGroup.add(
        park
    );


    clickableObjects.push(
        park
    );


    /* TREES */

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const tree =
    createTree(0, 0, 0, 1);

        tree.position.set(

            x +
            (Math.random() - 0.5) * 2.3,

            0.4,

            z +
            (Math.random() - 0.5) * 1.8

        );


        cityGroup.add(
            tree
        );

    }

}





/* =========================================
   BUS STOP
========================================= */


function createBusStop(
    x,
    y,
    z
) {

    createBuilding(

        x,
        y,
        z,

        1.5,
        0.8,
        1,

        0x59677d,

        "Central Bus Stop",

        "Public transport stop",

        "🚌"

    );

}


/* =========================================
   HOME
========================================= */


function createHome(
    x,
    y,
    z
) {

    const house =
        createBuilding(

            x,
            y,
            z,

            1.5,
            1.6,
            1.5,

            0x536b7d,

            "My Home",

            "Private location marker",

            "🏠"

        );


    /* Roof */

    const roofGeometry =
        new THREE.ConeGeometry(
            1.2,
            0.8,
            4
        );


    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x30485b
        });


    const roof =
        new THREE.Mesh(
            roofGeometry,
            roofMaterial
        );


    roof.position.set(
        x,
        y + 1.15,
        z
    );


    roof.rotation.y =
        Math.PI / 4;


    cityGroup.add(
        roof
    );

}


/* =========================================
   CLICK DETECTION
========================================= */


function onMapClick(event) {

    const rect =
        renderer.domElement.getBoundingClientRect();


    mouse.x =
        (
            (event.clientX - rect.left)
            /
            rect.width
        ) * 2 - 1;


    mouse.y =
        -(
            (event.clientY - rect.top)
            /
            rect.height
        ) * 2 + 1;


    raycaster.setFromCamera(
        mouse,
        camera
    );


    const intersections =
        raycaster.intersectObjects(
            clickableObjects
        );


    if (
        intersections.length > 0
    ) {

        const facility =
            intersections[0].object;


        selectedFacility =
            facility.userData;


        showFacility(
            facility.userData
        );

    }

}


/* =========================================
   FACILITY POPUP
========================================= */


function showFacility(
    facility
) {

    document
        .getElementById("facilityIcon")
        .innerText =
        facility.icon;


    document
        .getElementById("facilityName")
        .innerText =
        facility.name;


    document
        .getElementById("facilityInfo")
        .innerText =
        facility.info;


    document
        .getElementById("facilityPopup")
        .style.display =
        "block";

}


function closeFacility() {

    document
        .getElementById("facilityPopup")
        .style.display =
        "none";

}


function facilityAction() {

    const panel = document.getElementById("facilityDetailsPanel");

    if (!panel) {
        console.log("Facility details panel not found.");
        return;
    }

    document.getElementById("detailsIcon").textContent =
        document.getElementById("facilityIcon").textContent;

    document.getElementById("detailsName").textContent =
        document.getElementById("facilityName").textContent;

    const currentFacility = facilityData.find(facility =>
        facility.name === document.getElementById("facilityName").textContent
    );

    if (currentFacility && currentFacility.type === "Private") {
    closeFacility();
    return;
}

    if (currentFacility) {

        document.getElementById("detailsType").textContent =
            currentFacility.type;

        document.getElementById("detailsTimings").textContent =
            currentFacility.timings;

        document.getElementById("detailsAccessibility").textContent =
            currentFacility.accessibility;

        document.getElementById("detailsServices").textContent =
            currentFacility.services.join(", ");

    } else {

        document.getElementById("detailsType").textContent =
            "Public Facility";

        document.getElementById("detailsTimings").textContent =
            "Information available in demo";

        document.getElementById("detailsAccessibility").textContent =
            "Accessible entrance";

        document.getElementById("detailsServices").textContent =
            "Public services";
    }

    document.getElementById("detailsLocation").textContent =
        "Demo Locality";

    panel.style.display = "block";
}

function closeFacilityDetails() {

    const panel = document.getElementById("facilityDetailsPanel");

    if (panel) {
        panel.style.display = "none";
    }
}

function giveFacilityFeedback() {

    closeFacilityDetails();
    closeFacility();

    openCitizenForm("feedback");

}



function findFacilityOnMap() {

    closeFacilityDetails();

    alert("📍 Facility selected on the 3D locality map.");
}

/* =========================================
   ANIMATION
========================================= */


function animate3D() {

    requestAnimationFrame(
        animate3D
    );


    renderer.render(
        scene,
        camera
    );

}


/* =========================================
   RESIZE
========================================= */


function resize3D() {

    const container =
        document.getElementById(
            "city3d"
        );


    if (!container) {
        return;
    }


    camera.aspect =
        container.clientWidth /
        container.clientHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

}


/* =========================================
   START
========================================= */


window.addEventListener(
    "load",
    init3D
);

/* =========================================
   CITIZEN FEEDBACK SYSTEM
========================================= */

let currentCitizenType = "feedback";


function openCitizenForm(type) {

    const modal = document.getElementById("citizenModal");

    const title = document.getElementById("citizenFormTitle");

    const subtitle = document.getElementById("citizenFormSubtitle");

    const icon = document.getElementById("citizenFormIcon");


    currentCitizenType = type;


    if (type === "feedback") {

        icon.textContent = "🗣️";

        title.textContent = "Give Feedback";

        subtitle.textContent =
            "Tell us about your experience in the locality.";

    }


    else if (type === "problem") {

        icon.textContent = "🚨";

        title.textContent = "Report a Problem";

        subtitle.textContent =
            "Tell us about an issue that needs attention.";

    }


    else if (type === "suggestion") {

        icon.textContent = "💡";

        title.textContent = "Suggest a Facility";

        subtitle.textContent =
            "Tell us what facility your community needs.";

    }


    modal.style.display = "flex";
}


function closeCitizenForm() {

    const modal =
        document.getElementById("citizenModal");

    modal.style.display = "none";

}


function submitCitizenForm() {

    const category =
        document.getElementById("citizenCategory").value;

    const message =
        document.getElementById("citizenMessage").value.trim();

        const location =
    document.getElementById("citizenLocation").value;

    if (category === "") {
        alert("Please select a category.");
        return;
    }

    if (message === "") {
        alert("Please describe your feedback, problem or suggestion.");
        return;
    }

    const report = {
    id: Date.now(),
    type: currentCitizenType,
    category: category,
    location: location,
    message: message,
    photoAttached: document.getElementById("citizenPhoto").files.length > 0,
    status: "Submitted",
    date: new Date().toLocaleString()
};
    let reports =
        JSON.parse(localStorage.getItem("civicReports")) || [];

    reports.push(report);

    localStorage.setItem(
        "civicReports",
        JSON.stringify(reports)
    );

    alert(
        "Thank you! Your " +
        currentCitizenType +
        " has been submitted successfully."
    );

    document.getElementById("citizenCategory").value = "";
    document.getElementById("citizenMessage").value = "";
    document.getElementById("citizenLocation").value = "";
    document.getElementById("citizenPhoto").value = "";

    closeCitizenForm();
}


    // =========================================
// YOU ASKED → WE HEARD
// =========================================

function loadMyReports() {

    const reports =
        JSON.parse(
            localStorage.getItem("civicReports") || "[]"
        );

    const container =
        document.getElementById("myReports");

    if (!container) return;

    if (reports.length === 0) {

        container.innerHTML = `
            <p>
                You have not submitted any reports yet.
            </p>
        `;

        return;
    }

    container.innerHTML = "";

    reports.slice().reverse().forEach(function(report) {

        let statusIcon = "🔵";

        if (report.status === "In Progress") {
            statusIcon = "🟡";
        }

        if (report.status === "Completed") {
            statusIcon = "🟢";
        }

        container.innerHTML += `

            <div class="citizen-report-card">

                <h3>
                    ${report.category}
                </h3>

                <p>
                    ${report.message}
                </p>

                <p>
                    ${statusIcon}
                    <strong>${report.status}</strong>
                </p>

                <small>
                    Submitted: ${report.date}
                </small>

            </div>

        `;

    });

}

/* =====================================================
   CIVICWORLD — VISIBLE SCROLL REVEAL
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const scrollElements = document.querySelectorAll(
        ".facility-card, .participation > div"
    );

    scrollElements.forEach(function (element) {
        element.classList.add("scroll-card");
    });


    const revealObserver = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    revealObserver.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.20
        }
    );


    scrollElements.forEach(function (element) {
        revealObserver.observe(element);
    });

});

/* =====================================================
   CIVICWORLD — SCROLL REVEAL SYSTEM
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const scrollElements = document.querySelectorAll(
        ".facility-card, .participation > div, .facility-grid"
    );

    scrollElements.forEach(function (element) {
        element.classList.add("scroll-card");
    });


    const revealObserver = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    revealObserver.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );


    scrollElements.forEach(function (element) {
        revealObserver.observe(element);
    });

});