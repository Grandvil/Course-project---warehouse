var container, camera, renderer, controls, ellipsoid, box, sphere, singleGeometry, boxMesh, sphereMesh,
    material, mesh, bounding_box, torus, cone, ellipsoid_clone, field, windowMesh;

var barrel = new THREE.Object3D;
var bucket = new THREE.Object3D;

const deskMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF
});

var ticTacToeField = {}
let gameState = false;
let ticTacToeArr = ['first', 'second', 'third', 'fourth', 'fifth',
    'sixth', 'seventh', 'eighth', 'nineth'
];

var textField = document.getElementById("textBlock");
textField.style = "display: none";

var score = 0;
var scoreCount = document.getElementById("scoreCount");

var Key = {
    _pressed: {},

    first: 49,
    second: 50,
    third: 51,
    fourth: 52,
    fifth: 53,
    sixth: 54,
    seventh: 55,
    eighth: 56,
    nineth: 57,


    A: 65,
    W: 87,
    D: 68,
    S: 83,
    SPACE: 32,

    Z: 90,
    X: 88,

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },
    onKeydown: function (event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyup: function (event) {
        delete this._pressed[event.keyCode];
    }
}

var objects = [];
var SELECTED = null;
var sceneSize = 200;

var scene = new THREE.Scene();

window.onload = function () {
    init();
    animate();
}

function init() {
    AddCamera(570, 300, 400);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.getElementById('MyWebGLApp');
    container.appendChild(renderer.domElement);
    document.body.appendChild(renderer.domElement);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(sceneSize, sceneSize / 2, sceneSize / 2);

    var axes = new THREE.AxisHelper(sceneSize * 3);
    axes.position.set(0, 0, 0);
    var gridXZ = new THREE.GridHelper(sceneSize, 20);
    gridXZ.setColors(new THREE.Color(0x660000),
        new THREE.Color(0x660000));
    gridXZ.position.set(sceneSize, -1, sceneSize);

    var gridXY = new THREE.GridHelper(sceneSize, 20);
    gridXY.position.set(sceneSize, sceneSize, 0);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.setColors(new THREE.Color(0xffffff), new THREE.Color(0xffffff));

    var gridYZ = new THREE.GridHelper(sceneSize, 20);
    gridYZ.position.set(0, sceneSize, sceneSize);
    gridYZ.rotation.z = Math.PI / 2;
    gridYZ.setColors(new THREE.Color(0x666600), new THREE.Color(0x666600));


    let generateTheWall = (rotationX, rotationY, positionX, positionY, positionZ, textureSrc, windows) => {
        var windowGeometry = new THREE.BoxGeometry(60, 120, 2);
        var windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x628090
        });


        var septumTexture = new THREE.ImageUtils.loadTexture('assets/wood.jpg');
        septumTexture.minFilter = THREE.NearestFilter;
        var septumGeometry = new THREE.BoxGeometry(10, 140, 2);
        var septumMaterial = new THREE.MeshPhongMaterial({
            map: septumTexture
        });

        let generateTheSeptum = (x, y, horizontal) => {
            var septumMesh = new THREE.Mesh(septumGeometry, septumMaterial);
            if (horizontal) {
                septumMesh.rotation.z = Math.PI / 2;
            }
            septumMesh.position.set(x, y, 0);
            wallMesh.add(septumMesh);
        }

        let generateTheWindow = (x, y) => {
            var windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(x, y, 0);
            wallMesh.add(windowMesh);
        }
        var texture = new THREE.ImageUtils.loadTexture(textureSrc);
        texture.minFilter = THREE.NearestFilter;

        var wallGeometry = new THREE.BoxGeometry(sceneSize * 2, sceneSize * 2, 1);
        var wallMaterial = new THREE.MeshPhongMaterial({
            map: texture
        });
        var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(positionX, positionY, positionZ);


        wallMesh.rotation.x = rotationX;
        wallMesh.rotation.y = rotationY;
        scene.add(wallMesh);

        if (windows) {
            generateTheSeptum(-25, 0, false);
            generateTheWindow(-60, 0);
            generateTheSeptum(-100, -65, true);
            generateTheSeptum(-95, 0, false);
            generateTheWindow(-130, 0);
            generateTheSeptum(-100, 65, true);
            generateTheSeptum(-165, 0, false);
        }
    }

    let generateCone = () => {
        var cone_material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            vertexColors: THREE.FaceColors
        });
        var cone_geometry = new THREE.CylinderGeometry(0, 40, 70, 50);
        cone = new THREE.Mesh(cone_geometry, cone_material);
        cone.position.set(150, 35, 40);
        cone.geometry.computeVertexNormals(false);
        cone.name = "конус";
        // scene.add(cone);
        objects.push(cone);
    }

    let generateEllipsoid = () => {
        var ellipsoid_material = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        var ellipsoid_geometry = new THREE.SphereGeometry(20, 16, 16, Math.PI, 2 * Math.PI, Math.PI, Math.PI);
        ellipsoid = new THREE.Mesh(ellipsoid_geometry, ellipsoid_material);
        ellipsoid.position.set(100, 20, 100);
        ellipsoid.geometry.computeFaceNormals();
        ellipsoid.scale.x = 1.5;

        ellipsoid_clone = ellipsoid.clone();
        ellipsoid_clone.position.set(150, 20, 170);
        ellipsoid_clone.name = "эллипсоид";
        // scene.add(ellipsoid_clone);
        objects.push(ellipsoid_clone);
    }

    let generateMultiObject = () => {
        var obj_material = [
            new THREE.MeshLambertMaterial({
                wireframe: false,
                side: THREE.DoubleSide,
                color: 0xff0365,
                emissive: 0xff0000
            }),
            new THREE.MeshBasicMaterial({
                wireframe: true,
                side: THREE.DoubleSide,
                color: 0xff0000
            })
        ];
        box = new THREE.BoxGeometry(50, 50, 50);
        sphere = new THREE.SphereGeometry(30, 16, 16, Math.PI, 2 * Math.PI, Math.PI, Math.PI);
        singleGeometry = new THREE.Geometry();
        boxMesh = new THREE.Mesh(box);
        sphereMesh = new THREE.Mesh(sphere);
        boxMesh.updateMatrix();
        singleGeometry.mergeMesh(boxMesh, boxMesh);
        sphereMesh.updateMatrix();
        singleGeometry.mergeMesh(sphereMesh, sphereMesh);
        material = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });
        mesh = THREE.SceneUtils.createMultiMaterialObject(singleGeometry, obj_material);
        mesh.position.set(50, 25, 345);
        // scene.add(mesh);
    }

    let generateTorus = () => {
        var torus_geometry = new THREE.TorusGeometry(15, 5, 8, 16, 360 * Math.PI / 180);
        var torus_material = new THREE.MeshLambertMaterial({
            color: 0xff0365
        });
        torus = new THREE.Mesh(torus_geometry, torus_material);
        torus.position.set(50, 30, 20);
        torus.name = "тор";
        objects.push(torus);
        // scene.add(torus);
    }

    let generateBarrel = () => {
        var points = [];
        for (var i = -2; i < 1.5; i = i + 0.1) {
            points.push(new THREE.Vector3(15 + 5 * Math.exp(-i * i), 25, 20 * i));
        }

        var texture = new THREE.ImageUtils.loadTexture('assets/barrelTexture.jpg');
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        var barrel_material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            map: texture,
            color: 0xdaa520,
            specular: 0x00b2fc,
            shininess: 50,
            blending: THREE.NormalBlending,
            depthTest: true
        });

        var dno_geometry = new THREE.CylinderGeometry(29.5, 25, 0, 32);
        var disc1 = new THREE.Mesh(dno_geometry, barrel_material);
        disc1.position.set(50, 0, 150);

        var geometry = new THREE.LatheGeometry(points, 32);
        var wall = new THREE.Mesh(geometry, barrel_material);
        wall.position.set(50, 26, 150);
        wall.rotation.x = Math.PI / 2;

        barrel.add(wall);
        barrel.add(disc1);
        scene.add(barrel);
    }

    let generateShipher = () => {
        ParamFunction = function (u, v) {
            var x = -80 + 80 * u;
            var y = 3 * Math.sin(30 * (u + v));
            var z = -80 + 80 * v;
            return new THREE.Vector3(z, x, y);
        };
        graphGeometry = new THREE.ParametricGeometry(ParamFunction, 32, 32, false);
        var shifer_material = new THREE.MeshPhongMaterial({
            color: 0x708090,
            metal: true,
            emissive: 0x708090,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending,
            depthTest: true
        });
        graphMesh = new THREE.Mesh(graphGeometry, shifer_material);
        graphMesh.doubleSided = true;
        graphMesh.position.set(80, 3, 80);
        graphMesh.rotation.x = Math.PI / 2;
        scene.add(graphMesh);
        graphMesh.name = "шифер";
        objects.push(graphMesh);
    }

    let generateBoxesTerrain = () => {
        let terrainSize = 20;
        let boxTexture = new THREE.ImageUtils.loadTexture('assets/barrelTexture.jpg');
        boxTexture.minFilter = THREE.NearestFilter;
        let boxSize = 28;
        let geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        let material = new THREE.MeshPhongMaterial({
            color: 0x708090,
            side: THREE.DoubleSide,
            depthTest: true,
            map: boxTexture,
        });

        for (let i = 0.3; i <= terrainSize / 4; i++) {
            for (let j = 3; j <= terrainSize / 4; j++) {
                let boxes = new THREE.Mesh(geometry, material);
                boxes.position.set(250, 14, 10);
                boxes.position.x = j * 70;
                boxes.position.z = i * 70;
                scene.add(boxes);
            }
        }
    }

    let generateFire = () => {
        const particleCount = 1500;
        const fireSize = 45;
        var particles = new THREE.Geometry();
        var pMaterial = new THREE.PointsMaterial({
            color: 0x808080,
            size: 5
        });
        for (var i = 0; i < particleCount; i++) {
            var pX = Math.trunc(Math.random() * fireSize) + 28;
            var pY = Math.trunc(Math.random() * fireSize) + 50;
            var pZ = Math.trunc(Math.random() * fireSize + 128);
            var particle = new THREE.Vector3(pX, pY, pZ);
            particles.vertices.push(particle);
        }

        var particleSystem = new THREE.Points(
            particles,
            pMaterial
        );

        barrel.add(particleSystem);

        function animate() {
            requestAnimationFrame(animate);
            particles.vertices.forEach(function (particle) {
                particle.y += Math.random() * 0.3;
                if (particle.y > fireSize + 70) {
                    particle.y = 60;
                }
            });
            particleSystem.geometry.verticesNeedUpdate = true;
        }
        animate();
    }

    let generateBlenderModel = () => {
        let modelSize = 24;

        function addModelToScene(geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            var model = new THREE.Mesh(geometry, material);
            model.scale.set(modelSize, modelSize, modelSize);
            model.position.set(54, 25, 270);
            // scene.add(model);
        }

        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load("magic-box.js", addModelToScene);


    }

    let generateRain = () => {

        const drop_material = new THREE.MeshBasicMaterial({
            color: 0x00A5FF
        });
        const drop_circle_geometry = new THREE.SphereGeometry(3, 32, 32);
        var drop_part_geometry = new THREE.CylinderGeometry(0, 3, 15, 32);
        var drop_part_mash = new THREE.Mesh(drop_part_geometry, drop_material);
        let dropped;

        const drops = [];
        const drop = new THREE.Mesh(drop_circle_geometry, drop_material);
        drop_part_mash.position.set(0, 8, 0)
        drop.add(drop_part_mash);

        function addDrop() {
            dropped = false;
            drop.position.x = 140;
            drop.position.y = 400;
            drop.position.z = Math.random() * sceneSize * 2;
            scene.add(drop);
            drops.push(drop);
        }
        addDrop();

        function animateDrops() {
            drops.forEach((drop) => {
                if (!dropped) {
                    // скорость капли
                    drop.position.y -= 0.5;
                    if ((drop.position.z > bucket.position.z) &&
                        (drop.position.z < bucket.position.z + 60) &&
                        (drop.position.y < 40)) {
                        score += 1;
                        scoreCount.innerHTML = score;
                        dropped = true;
                        scene.remove(drop);
                        setTimeout(addDrop, 2000);
                    } else if (drop.position.y < 5) {
                        dropped = true;
                        scene.remove(drop);

                        const dropPieces = [];
                        const pieceCount = 10;
                        const pieceGeometry = new THREE.SphereGeometry(2, 16, 16);
                        const pieceMaterial = drop_material;
                        for (let i = 0; i < pieceCount; i++) {
                            const piece = new THREE.Mesh(pieceGeometry, pieceMaterial);
                            dropPieces.push(piece);
                            scene.add(piece);
                        }
                        const explosionSpeed = 10;
                        const duration = 0.5;
                        const endTime = performance.now() + duration * 1000;

                        function animatePieces() {
                            const remainingTime = endTime - performance.now();
                            if (remainingTime <= 0) {
                                dropPieces.forEach((piece) => {
                                    scene.remove(piece);
                                });
                            } else {
                                dropPieces.forEach((piece) => {
                                    const theta = Math.random() * Math.PI * 2;
                                    const phi = Math.random() * Math.PI - Math.PI / 2;
                                    const direction = new THREE.Vector3(
                                        Math.sin(theta) * Math.cos(phi),
                                        Math.sin(phi),
                                        Math.cos(theta) * Math.cos(phi)
                                    );
                                    const speed = Math.random() * explosionSpeed;
                                    piece.userData.velocity = direction.multiplyScalar(speed);
                                    if (piece.userData.velocity.y > 0) {
                                        piece.position.x = piece.userData.velocity.x + 140;
                                        piece.position.y = piece.userData.velocity.y + drop.position.y;
                                        piece.position.z = piece.userData.velocity.z + drop.position.z;
                                    }
                                });
                                requestAnimationFrame(animatePieces);
                            }
                        }
                        animatePieces();
                        // скорость генерации капли
                        setTimeout(addDrop, 3000);
                    }
                }
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            animateDrops();
        }
        animate();
    };


    let generateBucket = () => {

        var bucket_material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
        });
        var bucket_geometry = new THREE.CylinderGeometry(20, 15, 40, 40);
        var bucket_cover = new THREE.Mesh(bucket_geometry, bucket_material);
        bucket_cover.geometry.computeVertexNormals(false);

        var water_material = new THREE.MeshBasicMaterial({
            color: 0x00A5FF,
        })
        var water_geometry = new THREE.CylinderGeometry(18, 5, 39, 39);
        var water = new THREE.Mesh(water_geometry, water_material);

        bucket_cover.position.set(150, 19, 30);
        water.position.set(150, 20, 30);

        bucket.add(water);
        bucket.add(bucket_cover);

        scene.add(bucket);
    }


    let generateTicTacToe = () => {
        const fieldGeometry = new THREE.BoxGeometry(200, 200, 1);
        let fieldTexture = new THREE.ImageUtils.loadTexture('assets/blackboard.jpg');
        fieldTexture.minFilter = THREE.NearestFilter;
        const fieldMaterial = new THREE.MeshBasicMaterial({
            map: fieldTexture
        });
        field = new THREE.Mesh(fieldGeometry, fieldMaterial);

        const horizontalGeometry = new THREE.BoxGeometry(150, 1, 1);
        const verticalGeometry = new THREE.BoxGeometry(1, 150, 1);

        const firstLine = new THREE.Mesh(horizontalGeometry, deskMaterial);
        const secondLine = new THREE.Mesh(horizontalGeometry, deskMaterial);
        const thirdLine = new THREE.Mesh(verticalGeometry, deskMaterial);
        const fourthLine = new THREE.Mesh(verticalGeometry, deskMaterial);
        firstLine.position.set(0, 25, 1);
        secondLine.position.set(0, -25, 1);
        thirdLine.position.set(25, 0, 1);
        fourthLine.position.set(-25, 0, 1);


        field.add(firstLine, secondLine, thirdLine, fourthLine);
        field.position.set(290, 150, 1);
        scene.add(field);

    }
    generateTheWall(0, 0, 200, 199, 0, 'assets/wall.jpg', true);
    generateTheWall(0, Math.PI / 2, 0, 199, 200, 'assets/wall.jpg', true);
    generateTheWall(Math.PI / 2, 0, 200, -1, 200, 'assets/floor.jpg');

    generateCone();
    generateEllipsoid();
    generateMultiObject();
    generateTorus();
    generateBlenderModel();

    generateBarrel();
    generateBucket();
    generateRain();
    generateShipher();
    generateBoxesTerrain();
    generateFire();
    generateTicTacToe();

    bounding_box = new THREE.BoundingBoxHelper(ellipsoid_clone, 0xffffff);
    scene.add(directionalLight, axes, gridXZ, gridXY, gridYZ);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, true);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
}

const ticTacToe = (index) => {
    let currentX = 0;
    let currentY = 0;

    const checkTheWin = () => {
        switch (true) {
            case (ticTacToeField.first === ticTacToeField.second &&
                ticTacToeField.second === ticTacToeField.third) &&
            (ticTacToeField.first === 'X' || ticTacToeField.first === 'O'):
                return 'over';
            case (ticTacToeField.fourth === ticTacToeField.fifth &&
                ticTacToeField.fifth === ticTacToeField.sixth) &&
            (ticTacToeField.fourth === 'X' || ticTacToeField.fourth === 'O'):
                return 'over';
            case (ticTacToeField.seventh === ticTacToeField.eighth &&
                ticTacToeField.eighth === ticTacToeField.nineth) &&
            (ticTacToeField.seventh === 'X' || ticTacToeField.seventh === 'O'):
                return 'over';
            case (ticTacToeField.first === ticTacToeField.fourth &&
                ticTacToeField.fourth === ticTacToeField.seventh) &&
            (ticTacToeField.first === 'X' || ticTacToeField.first === 'O'):
                return 'over';
            case (ticTacToeField.second === ticTacToeField.fifth &&
                ticTacToeField.fifth === ticTacToeField.eighth) &&
            (ticTacToeField.second === 'X' || ticTacToeField.second === 'O'):
                return 'over';
            case (ticTacToeField.third === ticTacToeField.sixth &&
                ticTacToeField.sixth === ticTacToeField.nineth) &&
            (ticTacToeField.third === 'X' || ticTacToeField.third === 'O'):
                return 'over';
            case (ticTacToeField.first === ticTacToeField.fifth &&
                ticTacToeField.fifth === ticTacToeField.nineth) &&
            (ticTacToeField.first === 'X' || ticTacToeField.first === 'O'):
                return 'over';
            case (ticTacToeField.seventh === ticTacToeField.fifth &&
                ticTacToeField.fifth === ticTacToeField.third) &&
            (ticTacToeField.seventh === 'X' || ticTacToeField.seventh === 'O'):
                return 'over';
            case (Object.keys(ticTacToeField).length === 9):
                return 'even';
            default:
                return;
        }
    }

    if (!gameState) {
        const generateTheCross = (currentX, currentY) => {
            const crossGeometry = new THREE.Geometry();

            const diagonal1Geometry = new THREE.BoxGeometry(50, 2, 2);
            diagonal1Geometry.rotateZ(Math.PI / 4);
            crossGeometry.merge(diagonal1Geometry);

            const diagonal2Geometry = new THREE.BoxGeometry(50, 2, 2);
            diagonal2Geometry.rotateZ(-Math.PI / 4);
            crossGeometry.merge(diagonal2Geometry);
            const crossMaterial = deskMaterial;

            const crossMesh = new THREE.Mesh(crossGeometry, crossMaterial);

            crossMesh.position.set(currentX, currentY, 3);

            field.add(crossMesh);

            if (checkTheWin() !== 'over' && checkTheWin() !== 'even') {
                generateTheCircle();
            } else if (checkTheWin() === 'even') {
                textField.style = "display: block";
                textField.innerHTML = "Ничья"
                gameState = true;
            } else {
                textField.style = "display: block";
                textField.innerHTML = "Вы выиграли!"
                gameState = true;
            }
        }

        const generateTheCircle = () => {
            let rand = Math.floor(Math.random() * ticTacToeArr.length);

            switch (ticTacToeArr[rand]) {
                case 'first':
                    currentX = -50;
                    currentY = 50;
                    ticTacToeField.first = 'O';
                    break;
                case 'second':
                    currentX = 0;
                    currentY = 50;
                    ticTacToeField.second = 'O';
                    break;
                case 'third':
                    currentX = 50;
                    currentY = 50;
                    ticTacToeField.third = 'O';
                    break;
                case 'fourth':
                    currentX = -50;
                    currentY = 0;
                    ticTacToeField.fourth = 'O';
                    break;
                case 'fifth':
                    currentX = 0;
                    currentY = 0;
                    ticTacToeField.fifth = 'O';
                    break;
                case 'sixth':
                    currentX = 50;
                    currentY = 0;
                    ticTacToeField.sixth = 'O';
                    break;
                case 'seventh':
                    currentX = -50;
                    currentY = -50;
                    ticTacToeField.seventh = 'O';
                    break;
                case 'eighth':
                    currentX = 0;
                    currentY = -50;
                    ticTacToeField.eighth = 'O';
                    break;
                case 'nineth':
                    currentX = 50;
                    currentY = -50;
                    ticTacToeField.nineth = 'O';
                    break;
                default:
                    break;
            }

            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== ticTacToeArr[rand]
            })

            const ringGeometry = new THREE.TorusGeometry(18, 1, 16, 100);
            const ringMaterial = deskMaterial;
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);

            ring.position.set(currentX, currentY, 3);
            field.add(ring);

            if (checkTheWin() === 'over') {
                textField.style = "display: block";
                textField.innerHTML = "Вы проиграли!"
                gameState = true;
            } else if (checkTheWin() === 'even') {
                textField.style = "display: block";
                textField.innerHTML = "Ничья"
                gameState = true;
            }
        }

        switch (index) {

            case 49:
                currentX = -50;
                currentY = 50;
                if (!ticTacToeField.first) {
                    ticTacToeField.first = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 50:
                currentX = 0;
                currentY = 50;
                if (!ticTacToeField.second) {
                    ticTacToeField.second = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 51:
                currentX = 50;
                currentY = 50;
                if (!ticTacToeField.third) {
                    ticTacToeField.third = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 52:
                currentX = -50;
                currentY = 0;
                if (!ticTacToeField.fourth) {
                    ticTacToeField.fourth = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 53:
                currentX = 0;
                currentY = 0;
                if (!ticTacToeField.fifth) {
                    ticTacToeField.fifth = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 54:
                currentX = 50;
                currentY = 0;
                if (!ticTacToeField.sixth) {
                    ticTacToeField.sixth = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 55:
                currentX = -50;
                currentY = -50;
                if (!ticTacToeField.seventh) {
                    ticTacToeField.seventh = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 56:
                currentX = 0;
                currentY = -50;
                if (!ticTacToeField.eighth) {
                    ticTacToeField.eighth = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;

            case 57:
                currentX = 50;
                currentY = -50;
                if (!ticTacToeField.nineth) {
                    ticTacToeField.nineth = 'X';
                    generateTheCross(currentX, currentY);
                }
                break;
        }
    }
}


function dynamo() {
    if (!gameState) {
        if (Key.isDown(Key.first)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'first'
            })
            ticTacToe(Key.first);
        }
        if (Key.isDown(Key.second)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'second'
            })
            ticTacToe(Key.second);
        }
        if (Key.isDown(Key.third)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'third'
            })
            ticTacToe(Key.third);
        }
        if (Key.isDown(Key.fourth)) {

            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'fourth'
            })
            ticTacToe(Key.fourth);
        }
        if (Key.isDown(Key.fifth)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'fifth'
            })
            ticTacToe(Key.fifth);
        }
        if (Key.isDown(Key.sixth)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'sixth'
            })
            ticTacToe(Key.sixth);
        }
        if (Key.isDown(Key.seventh)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'seventh'
            })
            ticTacToe(Key.seventh);
        }
        if (Key.isDown(Key.eighth)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'eighth'
            })
            ticTacToe(Key.eighth);
        }
        if (Key.isDown(Key.nineth)) {
            ticTacToeArr = ticTacToeArr.filter(function (item) {
                return item !== 'nineth'
            })
            ticTacToe(Key.nineth);
        }
    }

    if (Key.isDown(Key.A)) {
        barrel.position.x -= 10;
    }
    if (Key.isDown(Key.D)) {
        barrel.position.x += 10;
    }
    if (Key.isDown(Key.W)) {
        barrel.position.z -= 10;
    }
    if (Key.isDown(Key.S)) {
        barrel.position.z += 10;
    }
    if (Key.isDown(Key.SPACE)) {
        barrel.position.y += 10;
    }

    if (Key.isDown(Key.Z)) {
        if (bucket.position.z < sceneSize * 2 - 50) {
            bucket.position.z += 5;
        }
    }
    if (Key.isDown(Key.X)) {
        if (bucket.position.z > 0) {
            bucket.position.z -= 5;
        }
    }
}

function animate() {
    torus.rotateY(Math.PI / 360);
    ellipsoid.rotateY(Math.PI / 360);
    ellipsoid_clone.rotateY(Math.PI / 360);
    cone.rotateY(Math.PI / 360);

    dynamo();
    bounding_box.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function AddCamera(X, Y, Z) {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(X, Y, Z);
    controls = new THREE.TrackballControls(camera, container);
    controls.rotateSpeed = 2;
    controls.noZoom = false;
    controls.zoomSpeed = 1.2;
    controls.staticMoving = true;
}

function onDocumentMouseDown(event) {
    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    //
    vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        controls.enabled = false;
        SELECTED = intersects[0].object;
        // info.innerHTML = "Вы нажали на " + intersects[0].object.name;
        x_previous = SELECTED.position.x;
        z_previous = SELECTED.position.z;
    }
}

function onDocumentMouseMove(event) {
    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1, 0.5);

    vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    if (SELECTED) {
        var intersects = raycaster.intersectObjects(objects);
        SELECTED.position.x = intersects[0].point.sub(vector).x;
        SELECTED.position.z = intersects[0].point.sub(vector).z;
        SELECTED.position.y = 0;
        container.style.cursor = 'move';
    }
}

function onDocumentMouseUp(event) {
    controls.enabled = true;
    flag = false;
    if (SELECTED) {
        flag = true;
        SELECTED = null;
    }
    container.style.cursor = 'auto';
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keyup', function (event) {
        Key.onKeyup(event);
    },
    false
);

window.addEventListener('keydown', function (event) {
        Key.onKeydown(event);
    },
    false
);