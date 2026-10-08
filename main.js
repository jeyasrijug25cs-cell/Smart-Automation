// ============================================================
// AI INFORMATION COPILOT
// FULL MAIN JAVASCRIPT
// 3D CORE + UPLOAD + ANALYSIS + COPILOT
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let scene = null;
let camera = null;
let renderer = null;

let mainCore = null;
let innerCore = null;
let wireCore = null;
let glowCore = null;

let orbitRings = [];
let particles = null;
let dataNodes = [];


// ============================================================
// HTML ELEMENTS
// ============================================================

const fileInput =
    document.getElementById("fileInput");

const uploadBox =
    document.getElementById("uploadBox");

const documentList =
    document.getElementById("documentList");

const documentCount =
    document.getElementById("documentCount");

const statDocuments =
    document.getElementById("statDocuments");

const copilotButton =
    document.getElementById("copilotButton");


// ============================================================
// 3D AI CORE
// ============================================================

function createAI3D() {

    const container =
        document.getElementById("three-container");

    if (!container) {

        console.error(
            "❌ three-container not found"
        );

        return;
    }


    // --------------------------------------------------------
    // Remove old renderer if one exists
    // --------------------------------------------------------

    if (renderer) {

        renderer.dispose();

        if (
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement.parentNode.removeChild(
                renderer.domElement
            );
        }
    }


    // --------------------------------------------------------
    // CLEAR OLD DATA
    // --------------------------------------------------------

    orbitRings = [];
    dataNodes = [];

    particles = null;


    // ========================================================
    // SCENE
    // ========================================================

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x020817
        );


    // ========================================================
    // CAMERA
    // ========================================================

    const width =
        container.clientWidth || 600;

    const height =
        container.clientHeight || 400;


    camera =
        new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );


    camera.position.set(
        0,
        0,
        6
    );


    // ========================================================
    // RENDERER
    // ========================================================

    renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: true
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );


    renderer.setSize(
        width,
        height
    );


    renderer.domElement.style.display =
        "block";


    renderer.domElement.style.width =
        "100%";


    renderer.domElement.style.height =
        "100%";


    container.appendChild(
        renderer.domElement
    );


    // ========================================================
    // LIGHTS
    // ========================================================

    const ambientLight =
        new THREE.AmbientLight(
            0x4b9cff,
            1.5
        );


    scene.add(
        ambientLight
    );


    const blueLight =
        new THREE.PointLight(
            0x00cfff,
            5,
            20
        );


    blueLight.position.set(
        0,
        0,
        3
    );


    scene.add(
        blueLight
    );


    const sideLight =
        new THREE.PointLight(
            0x1769ff,
            2.5,
            15
        );


    sideLight.position.set(
        -3,
        2,
        2
    );


    scene.add(
        sideLight
    );


    // ========================================================
    // MAIN 3D CORE
    // ========================================================

    const coreGeometry =
        new THREE.IcosahedronGeometry(
            1.05,
            4
        );


    const coreMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x087cff,

            emissive: 0x005cff,

            emissiveIntensity: 1.8,

            metalness: 0.72,

            roughness: 0.18,

            transparent: true,

            opacity: 0.88
        });


    mainCore =
        new THREE.Mesh(
            coreGeometry,
            coreMaterial
        );


    scene.add(
        mainCore
    );


    // ========================================================
    // INNER 3D WIREFRAME
    // ========================================================

    const innerGeometry =
        new THREE.IcosahedronGeometry(
            1.10,
            3
        );


    const innerMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x62dcff,

            wireframe: true,

            transparent: true,

            opacity: 0.72
        });


    innerCore =
        new THREE.Mesh(
            innerGeometry,
            innerMaterial
        );


    scene.add(
        innerCore
    );


    // ========================================================
    // OUTER WIREFRAME
    // ========================================================

    const wireGeometry =
        new THREE.IcosahedronGeometry(
            1.42,
            2
        );


    const wireMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x58d9ff,

            wireframe: true,

            transparent: true,

            opacity: 0.42
        });


    wireCore =
        new THREE.Mesh(
            wireGeometry,
            wireMaterial
        );


    scene.add(
        wireCore
    );


    // ========================================================
    // OUTER GLOW
    // ========================================================

    const glowGeometry =
        new THREE.SphereGeometry(
            1.65,
            32,
            32
        );


    const glowMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x008cff,

            transparent: true,

            opacity: 0.08,

            side: THREE.BackSide
        });


    glowCore =
        new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );


    scene.add(
        glowCore
    );


    // ========================================================
    // ORBIT RINGS
    // ========================================================

    createOrbitRing(
        1.55,
        0.018,
        0x00e5ff,
        0.90,
        0.25
    );


    createOrbitRing(
        1.75,
        0.014,
        0x28cfff,
        0.75,
        -0.55
    );


    createOrbitRing(
        1.95,
        0.012,
        0x159eff,
        0.62,
        0.80
    );


    createOrbitRing(
        2.20,
        0.009,
        0x00c8ff,
        0.48,
        -0.90
    );


    createOrbitRing(
        2.45,
        0.007,
        0x67ddff,
        0.34,
        0.50
    );


    // ========================================================
    // PARTICLES
    // ========================================================

    createParticles();


    // ========================================================
    // DATA NODES
    // ========================================================

    createDataNodes();


    // ========================================================
    // START ANIMATION
    // ========================================================

    animateAI();
}


// ============================================================
// CREATE ORBIT RING
// ============================================================

function createOrbitRing(
    radius,
    thickness,
    color,
    opacity,
    angle
) {

    const geometry =
        new THREE.TorusGeometry(
            radius,
            thickness,
            8,
            160
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: color,

            transparent: true,

            opacity: opacity
        });


    const ring =
        new THREE.Mesh(
            geometry,
            material
        );


    ring.rotation.x =
        Math.PI / 2 + angle;


    ring.rotation.y =
        angle;


    ring.rotation.z =
        angle * 0.7;


    scene.add(
        ring
    );


    orbitRings.push(
        ring
    );
}


// ============================================================
// CREATE PARTICLES
// ============================================================

function createParticles() {

    const particleCount = 1800;


    const geometry =
        new THREE.BufferGeometry();


    const positions =
        new Float32Array(
            particleCount * 3
        );


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        const radius =
            2.6 +
            Math.random() * 4.2;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(
                2 * Math.random() - 1
            );


        positions[i * 3] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        positions[i * 3 + 1] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


        positions[i * 3 + 2] =
            radius *
            Math.cos(phi);
    }


    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({

            color: 0xffffff,

            size: 0.020,

            transparent: true,

            opacity: 0.85,

            sizeAttenuation: true
        });


    particles =
        new THREE.Points(
            geometry,
            material
        );


    scene.add(
        particles
    );
}


// ============================================================
// CREATE SMALL DATA NODES
// ============================================================

function createDataNodes() {

    const nodeGeometry =
        new THREE.SphereGeometry(
            0.035,
            8,
            8
        );


    const nodeMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x8beaff
        });


    for (
        let i = 0;
        i < 45;
        i++
    ) {

        const node =
            new THREE.Mesh(
                nodeGeometry,
                nodeMaterial
            );


        const radius =
            1.8 +
            Math.random() * 1.7;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(
                2 * Math.random() - 1
            );


        node.position.x =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        node.position.y =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


        node.position.z =
            radius *
            Math.cos(phi);


        scene.add(
            node
        );


        dataNodes.push(
            node
        );
    }
}


// ============================================================
// ANIMATE 3D CORE
// ============================================================

function animateAI() {

    requestAnimationFrame(
        animateAI
    );


    // --------------------------------------------------------
    // MAIN CORE ROTATION
    // --------------------------------------------------------

    if (mainCore) {

        mainCore.rotation.x +=
            0.0025;

        mainCore.rotation.y +=
            0.004;
    }


    // --------------------------------------------------------
    // INNER WIREFRAME ROTATION
    // --------------------------------------------------------

    if (innerCore) {

        innerCore.rotation.x -=
            0.003;

        innerCore.rotation.y +=
            0.005;
    }


    // --------------------------------------------------------
    // OUTER WIREFRAME ROTATION
    // --------------------------------------------------------

    if (wireCore) {

        wireCore.rotation.x +=
            0.0015;

        wireCore.rotation.y -=
            0.0025;
    }


    // --------------------------------------------------------
    // GLOW PULSE
    // --------------------------------------------------------

    if (glowCore) {

        const pulse =
            1 +
            Math.sin(
                Date.now() * 0.002
            ) * 0.045;


        glowCore.scale.setScalar(
            pulse
        );
    }


    // --------------------------------------------------------
    // RINGS ROTATION
    // --------------------------------------------------------

    orbitRings.forEach(
        function (ring, index) {

            ring.rotation.x +=
                0.0010 +
                index * 0.00025;


            ring.rotation.y +=
                0.0015 +
                index * 0.00030;


            ring.rotation.z +=
                0.0006;
        }
    );


    // --------------------------------------------------------
    // PARTICLES MOVEMENT
    // --------------------------------------------------------

    if (particles) {

        particles.rotation.y +=
            0.00035;


        particles.rotation.x +=
            0.00010;
    }


    // --------------------------------------------------------
    // DATA NODE MOVEMENT
    // --------------------------------------------------------

    dataNodes.forEach(
        function (node, index) {

            node.position.y +=
                Math.sin(
                    Date.now() * 0.001 +
                    index
                ) * 0.00035;
        }
    );


    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    if (
        renderer &&
        scene &&
        camera
    ) {

        renderer.render(
            scene,
            camera
        );
    }
}


// ============================================================
// RESIZE 3D
// ============================================================

function resizeAI() {

    const container =
        document.getElementById(
            "three-container"
        );


    if (
        !container ||
        !camera ||
        !renderer
    ) {

        return;
    }


    const width =
        container.clientWidth;


    const height =
        container.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;
    }


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height
    );
}


// ============================================================
// FILE INPUT
// ============================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            const files =
                Array.from(
                    this.files
                );


            if (files.length > 0) {

                uploadFiles(
                    files
                );
            }
        }
    );
}


// ============================================================
// DRAG AND DROP
// ============================================================

if (uploadBox) {

    uploadBox.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadBox.classList.add(
                "dragging"
            );
        }
    );


    uploadBox.addEventListener(
        "dragleave",
        function () {

            uploadBox.classList.remove(
                "dragging"
            );
        }
    );


    uploadBox.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadBox.classList.remove(
                "dragging"
            );


            const files =
                Array.from(
                    event.dataTransfer.files
                );


            if (files.length > 0) {

                uploadFiles(
                    files
                );
            }
        }
    );
}


// ============================================================
// UPLOAD MULTIPLE FILES
// ============================================================

async function uploadFiles(files) {

    for (
        const file of files
    ) {

        await uploadSingleFile(
            file
        );
    }


    updateDocumentCount();
}


// ============================================================
// UPLOAD SINGLE FILE
// ============================================================

async function uploadSingleFile(file) {

    const allowedExtensions = [
        "pdf",
        "docx",
        "txt"
    ];


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        alert(
            "❌ Unsupported file.\n\n" +
            "Please upload PDF, DOCX or TXT."
        );

        return;
    }


    // --------------------------------------------------------
    // CREATE PROCESSING CARD
    // --------------------------------------------------------

    const card =
        createUploadingCard(
            file.name,
            file.size
        );


    if (documentList) {

        documentList.appendChild(
            card
        );
    }


    // --------------------------------------------------------
    // FORM DATA
    // --------------------------------------------------------

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    try {

        updateProcessingStatus(
            "● PROCESSING"
        );


        const response =
            await fetch(
                "/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (
            data.status ===
            "success"
        ) {

            // ------------------------------------------------
            // UPDATE CARD
            // ------------------------------------------------

            card.innerHTML = `

                <div class="file-icon ${extension}">
                    ${extension.toUpperCase()}
                </div>

                <div class="document-info">

                    <strong>
                        ${escapeHTML(
                            data.filename
                        )}
                    </strong>

                    <span>
                        ${formatFileSize(
                            file.size
                        )}
                        • Processed
                    </span>

                </div>

                <span class="document-status">
                    ✓
                </span>
            `;


            // ------------------------------------------------
            // UPDATE INSIGHTS
            // ------------------------------------------------

            updateInsights(
                data.analysis
            );


            // ------------------------------------------------
            // UPDATE STATUS
            // ------------------------------------------------

            updateProcessingStatus(
                "● ANALYSIS COMPLETE"
            );


        } else {

            card.remove();


            alert(
                "❌ Upload failed\n\n" +
                (
                    data.message ||
                    "Unknown error."
                )
            );
        }


    } catch (error) {

        console.error(
            "Upload Error:",
            error
        );


        card.remove();


        updateProcessingStatus(
            "● CONNECTION ERROR"
        );


        alert(
            "❌ Cannot connect to Flask.\n\n" +
            "Please make sure app.py is running."
        );
    }
}


// ============================================================
// CREATE UPLOADING CARD
// ============================================================

function createUploadingCard(
    filename,
    size
) {

    const extension =
        filename
            .split(".")
            .pop()
            .toLowerCase();


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "document-card";


    card.innerHTML = `

        <div class="file-icon ${extension}">
            ${extension.toUpperCase()}
        </div>

        <div class="document-info">

            <strong>
                ${escapeHTML(filename)}
            </strong>

            <span>
                ${formatFileSize(size)}
                • Processing...
            </span>

        </div>

        <span class="document-status">
            ⟳
        </span>
    `;


    return card;
}


// ============================================================
// UPDATE DOCUMENT COUNT
// ============================================================

function updateDocumentCount() {

    if (!documentList) {
        return;
    }


    const cards =
        documentList.querySelectorAll(
            ".document-card"
        );


    const count =
        cards.length;


    if (documentCount) {

        documentCount.textContent =
            count;
    }


    if (statDocuments) {

        statDocuments.textContent =
            count;
    }
}


// ============================================================
// UPDATE SMART INSIGHTS
// ============================================================

function updateInsights(
    analysis
) {

    if (!analysis) {
        return;
    }


    const cards =
        document.querySelectorAll(
            ".insight-card"
        );


    // ========================================================
    // CARD 1 - DEADLINE
    // ========================================================

    if (cards[0]) {

        const title =
            cards[0].querySelector(
                "h3"
            );


        const paragraph =
            cards[0].querySelector(
                "p"
            );


        const action =
            cards[0].querySelector(
                ".insight-action strong"
            );


        if (title) {

            title.textContent =
                "Deadline Detected";
        }


        if (paragraph) {

            if (
                analysis.deadline &&
                analysis.deadline !==
                "No deadline detected."
            ) {

                paragraph.textContent =
                    "A deadline was detected: " +
                    analysis.deadline;

            } else {

                paragraph.textContent =
                    "No specific deadline was detected.";
            }
        }


        if (action) {

            action.textContent =
                analysis.deadline ||
                "Review";
        }
    }


    // ========================================================
    // CARD 2 - REQUIREMENTS
    // ========================================================

    if (cards[1]) {

        const title =
            cards[1].querySelector(
                "h3"
            );


        const paragraph =
            cards[1].querySelector(
                "p"
            );


        const action =
            cards[1].querySelector(
                ".insight-action strong"
            );


        if (title) {

            title.textContent =
                "Requirements Detected";
        }


        if (paragraph) {

            if (
                analysis.requirements &&
                analysis.requirements.length > 0
            ) {

                paragraph.textContent =
                    "Required information: " +
                    analysis.requirements.join(
                        ", "
                    );

            } else {

                paragraph.textContent =
                    "No specific requirements detected.";
            }
        }


        if (action) {

            action.textContent =
                analysis.requirements &&
                analysis.requirements.length > 0
                    ? analysis.requirements.length +
                      " items"
                    : "Review";
        }
    }


    // ========================================================
    // CARD 3 - ANALYSIS
    // ========================================================

    if (cards[2]) {

        const title =
            cards[2].querySelector(
                "h3"
            );


        const paragraph =
            cards[2].querySelector(
                "p"
            );


        const action =
            cards[2].querySelector(
                ".insight-action strong"
            );


        if (title) {

            title.textContent =
                "Information Analyzed";
        }


        if (paragraph) {

            paragraph.textContent =
                "The document has been successfully understood and analyzed.";
        }


        if (action) {

            action.textContent =
                analysis.priority ||
                "NORMAL";
        }
    }


    // ========================================================
    // NEXT BEST ACTION
    // ========================================================

    const nextAction =
        document.querySelector(
            ".next-action h3"
        );


    if (nextAction) {

        nextAction.textContent =
            analysis.next_action ||
            "Review the uploaded document.";
    }
}


// ============================================================
// PROCESSING STATUS
// ============================================================

function updateProcessingStatus(
    text
) {

    const status =
        document.querySelector(
            ".processing-text"
        );


    if (status) {

        status.textContent =
            text;
    }
}


// ============================================================
// ASK COPILOT
// ============================================================

if (copilotButton) {

    copilotButton.addEventListener(
        "click",
        askCopilot
    );
}


// ============================================================
// COPILOT FUNCTION
// ============================================================

async function askCopilot() {

    const question =
        prompt(

            "🤖 AI COPILOT\n\n" +

            "What do you want to know " +
            "about the uploaded document?"
        );


    // --------------------------------------------------------
    // CANCEL
    // --------------------------------------------------------

    if (
        question === null
    ) {

        return;
    }


    // --------------------------------------------------------
    // EMPTY QUESTION
    // --------------------------------------------------------

    if (
        question.trim() === ""
    ) {

        alert(
            "Please enter a question."
        );

        return;
    }


    // --------------------------------------------------------
    // BUTTON LOADING
    // --------------------------------------------------------

    const oldText =
        copilotButton.textContent;


    copilotButton.disabled =
        true;


    copilotButton.textContent =
        "✦ Copilot thinking...";


    try {

        // ----------------------------------------------------
        // SEND TO FLASK
        // ----------------------------------------------------

        const response =
            await fetch(
                "/copilot",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:
                            question.trim()
                    })
                }
            );


        // ----------------------------------------------------
        // SERVER ERROR
        // ----------------------------------------------------

        if (
            !response.ok
        ) {

            throw new Error(
                "Server error: " +
                response.status
            );
        }


        // ----------------------------------------------------
        // JSON
        // ----------------------------------------------------

        const data =
            await response.json();


        // ----------------------------------------------------
        // ANSWER
        // ----------------------------------------------------

        if (
            data.status ===
            "success"
        ) {

            alert(

                "🤖 AI COPILOT\n\n" +

                data.answer
            );

        } else {

            alert(

                "⚠️ COPILOT\n\n" +

                (
                    data.message ||
                    "Unable to answer."
                )
            );
        }


    } catch (error) {

        console.error(
            "Copilot Error:",
            error
        );


        alert(

            "❌ Copilot cannot connect " +
            "to Flask.\n\n" +

            "Please make sure app.py " +
            "is running."
        );
    }


    // --------------------------------------------------------
    // RESTORE BUTTON
    // --------------------------------------------------------

    copilotButton.disabled =
        false;


    copilotButton.textContent =
        oldText;
}


// ============================================================
// FORMAT FILE SIZE
// ============================================================

function formatFileSize(
    bytes
) {

    if (
        bytes === 0
    ) {

        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (

        parseFloat(

            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(1)

        )

        +

        " " +

        units[index]
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


// ============================================================
// INITIALIZE 3D
// ============================================================

if (
    typeof THREE !==
    "undefined"
) {

    createAI3D();

} else {

    console.error(
        "❌ Three.js is not loaded."
    );
}


// ============================================================
// RESIZE LISTENER
// ============================================================

window.addEventListener(
    "resize",
    resizeAI
);


// ============================================================
// INITIAL DOCUMENT COUNT
// ============================================================

updateDocumentCount();


// ============================================================
// CONSOLE
// ============================================================

console.log(
    "🤖 AI Information Copilot loaded successfully."
);

console.log(
    "✨ 3D AI Core initialized."
);