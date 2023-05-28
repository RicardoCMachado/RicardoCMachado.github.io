import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


        // ************************** //
        // Add Scene
        // ************************** //
        const scene = new THREE.Scene();


        // ************************** //
        // Add Camera
        // ************************** //
        const aspectRatio = window.innerWidth / window.innerHeight;
        const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        scene.add(camera);
        camera.position.z = 5;


        // ************************** //
        // Add Renderer
        // ************************** //
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff);
        document.body.appendChild(renderer.domElement);


        // ************************** //
        // Stuff to Move Camera
        // ************************** //
        let isDragging = false;
        let previousMousePosition = {
            x: 0,
            y: 0
        };

        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);

        function onMouseDown(event) {
            isDragging = true;
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }

        function onMouseMove(event) {
            if (isDragging) {
                const deltaMove = {
                    x: event.clientX - previousMousePosition.x,
                    y: event.clientY - previousMousePosition.y
                };

                const theta = 0.001 * deltaMove.x;

                camera.rotation.y += theta;

                previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        }


        function onMouseUp(event) {
            isDragging = false;
        }


        // ************************** //
        // Stuff to Move Character and Avoid Crossing Walls
        // ************************** //
        document.addEventListener('keydown', onKeyDown, false);

        function onKeyDown(event) {
            const movementSpeed = 1;

            const frontDirection = new THREE.Vector3(0, 0, -1);
            const sideDirection = new THREE.Vector3(-1, 0, 0);

            const frontMovement = frontDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
            const sideMovement = sideDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);

            switch (event.keyCode) {
                case 83: // w
                case 40: // up arrow
                    if (playerPos.z - movementSpeed >= (wallGroup.children[0].BBox.max.z) + movementSpeed && playerPos.y + 1 <= ceilingPlane.position.y) {
                        playerPos.add(frontMovement.multiplyScalar(-movementSpeed));
                    }
                    break;
                case 87: // s
                case 38: // down arrow
                    if (playerPos.z + movementSpeed <= wallGroup.children[3].BBox.min.z && playerPos.y - 1 >= floorPlane.position.y) {
                        playerPos.add(frontMovement.multiplyScalar(movementSpeed));
                    }
                    break;
                case 68: // a
                case 39: // left arrow
                    if (playerPos.x - movementSpeed >= wallGroup.children[1].BBox.max.x && playerPos.y + 1 <= ceilingPlane.position.y) {
                        playerPos.add(sideMovement.multiplyScalar(-movementSpeed));
                    }
                    break;
                case 65: // d
                case 37: // right arrow
                    if (playerPos.x + movementSpeed <= wallGroup.children[2].BBox.min.x && playerPos.y + 1 <= ceilingPlane.position.y) {
                        playerPos.add(sideMovement.multiplyScalar(movementSpeed));
                    }
                    break;
                case 32: // space
                    if (playerPos.y + 1 <= ceilingPlane.position.y - 1) {
                        playerPos.y += 1;
                    }
                    break;
                case 16: // shift
                    if (playerPos.y - 1 >= floorPlane.position.y + 4) {
                        playerPos.y -= 1;
                    }
                    break;
            }
        }



        // ************************** //
        // Add Player Position
        // ************************** //
        const playerPos = new THREE.Vector3(0, 3, 5);


        // ************************** //
        // Add Textures
        // ************************** //
        const textureLoader = new THREE.TextureLoader();

        const floorTexture = textureLoader.load('./images/floor.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(20, 20);

        const wallsTexture = textureLoader.load('./images/wall.png');
        wallsTexture.wrapS = THREE.RepeatWrapping;
        wallsTexture.wrapT = THREE.RepeatWrapping;
        wallsTexture.repeat.set(8, 8);

        const ceilingTexture = textureLoader.load('./images/ceiling.png');
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.repeat.set(4, 4);


        // ************************** //
        // Add Floor
        // ************************** //
        const planeGeometry = new THREE.PlaneGeometry(60, 45);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide});
        const floorPlane = new THREE.Mesh(planeGeometry, planeMaterial); 

        floorPlane.rotation.x = Math.PI / 2; 
        floorPlane.position.y = -Math.PI; 
        scene.add(floorPlane);

        // ************************** //
        // Add Ceiling
        // ************************** //
        const planeGeometry2 = new THREE.PlaneGeometry(60, 45); 
        const planeMateria2 = new THREE.MeshBasicMaterial({map: ceilingTexture, side: THREE.DoubleSide});
        const ceilingPlane = new THREE.Mesh(planeGeometry2, planeMateria2);

        ceilingPlane.rotation.x = Math.PI / 2; 
        ceilingPlane.position.y = 12;
        scene.add(ceilingPlane);



        // ************************** //
        // Add Walls
        // ************************** //
        let wallGroup = new THREE.Group(); 
        scene.add(wallGroup);


        const planeGeo = new THREE.PlaneGeometry(60, 45);
        const planeGeo2 = new THREE.PlaneGeometry(45, 45);
        const planeMat = new THREE.MeshBasicMaterial({map: wallsTexture,side: THREE.DoubleSide});


        // Front Wall
        const frontWall = new THREE.Mesh(planeGeo,planeMat);
        frontWall.position.z = -22.5; 

        // Back Wall
        const backWall = new THREE.Mesh(planeGeo,planeMat);
        backWall.position.z = 22.5; 


        // Left Wall
        const leftWall = new THREE.Mesh(planeGeo2,planeMat);
        leftWall.rotation.y = Math.PI / 2; 
        leftWall.position.x = -30; 

        // Right Wall
        const rightWall = new THREE.Mesh(planeGeo2,planeMat);
        rightWall.position.x = 30;
        rightWall.rotation.y = Math.PI / 2; 

        wallGroup.add(frontWall, leftWall, rightWall, backWall);


        for (let i = 0; i < wallGroup.children.length; i++) {
        wallGroup.children[i].BBox = new THREE.Box3();
        wallGroup.children[i].BBox.setFromObject(wallGroup.children[i]);
        }



          // ************************** //
        // Add Ambient Lights
        // ************************** //
        const ambientLight = new THREE.PointLight(0xffffff);
        ambientLight.position.copy(camera.position);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0x000000, 1);
        sunLight.position.set(0, 10, 0);
        scene.add(sunLight);

        // ************************** //
        // Add Models
        // ************************** //

        const loader = new GLTFLoader();
        
        function loadmodel(path, posicao, escala, rotacao) {
            loader.load(
            path,
            
            function ( gltf ) {
                gltf.scene.position.set(posicao.x, posicao.y, posicao.z);
                gltf.scene.scale.set(escala.x, escala.y, escala.z);
                gltf.scene.rotation.y = THREE.MathUtils.degToRad(rotacao);

                scene.add( gltf.scene );

            }
        );
        }

        function loadmodelwithbase(path, posicao, escala, rotacao) {
            loader.load(
            path,
            
            function ( gltf ) {
                gltf.scene.position.set(posicao.x, posicao.y, posicao.z);
                gltf.scene.scale.set(escala.x, escala.y, escala.z);
                gltf.scene.rotation.y = THREE.MathUtils.degToRad(rotacao);

                scene.add( gltf.scene );

                var texture = new THREE.TextureLoader().load('/images/marmore.jpeg');
                var material = new THREE.MeshBasicMaterial({ map: texture });
                var geometry = new THREE.BoxGeometry(4.2, 3, 4.2);
                var cube = new THREE.Mesh(geometry, material);

                cube.position.set(posicao.x, -2, posicao.z);

                scene.add(cube);

                const glassMaterial = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff, 
                    transparent: true, 
                    opacity: 0.3, 
                    roughness: 0.1, 
                    metalness: 0.0, 
                    side: THREE.DoubleSide,
                    });
                const glassGeometry = new THREE.BoxGeometry(4.2, 13, 4.2);
                const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
                glassMesh.position.set(posicao.x, 6, posicao.z);
                scene.add(glassMesh);


                const ambientLight = new THREE.DirectionalLight(0x000000, 1);
                ambientLight.position.set(posicao.x, posicao.y, posicao.z);
                scene.add(ambientLight);

                const ambientLight2 = new THREE.DirectionalLight(0x000000, 1);
                ambientLight2.position.set(posicao.x-3, 10, posicao.z);
                scene.add(ambientLight2);

                const ambientLight3 = new THREE.DirectionalLight(0x000000, 1);
                ambientLight3.position.set(posicao.x, 10, posicao.z + 2);
                scene.add(ambientLight3);

                const ambientLight4 = new THREE.DirectionalLight(0x000000, 1);
                ambientLight4.position.set(posicao.x, 10, posicao.z - 2);
                scene.add(ambientLight4);

                const poslamp = { x: posicao.x, y: 11.8, z: posicao.z };
                loadmodel('./models/ceiling_light/scene.gltf', poslamp, { x: 1, y: 1, z: 1 }, rotacao);

            }
        );
        }


        const position1 = { x: 28, y: -0.5, z: -15 }; 
        const scale1 =  { x: 0.0038, y: 0.0038, z: 0.0038 };
        loadmodelwithbase('./models/iron_man/scene.gltf', position1, scale1, -90);

        const position2 = { x: 28, y: -0.5, z: -7.5 }; 
        const scale2 =  { x: 0.052, y: 0.052, z: 0.052 };
        loadmodelwithbase('./models/spider/scene.gltf', position2, scale2, -90);

        const position3 = { x: 28, y: -0.5, z: 0 }; 
        const scale3 =  { x: 4, y: 4, z: 4 };
        loadmodelwithbase('./models/rocket/scene.gltf', position3, scale3, 170);

        const position4 = { x: 27, y: -0.5, z: 0 };
        const scale4 =  { x: 400, y: 400, z: 400 };
        loadmodel('./models/groot/scene.gltf', position4, scale4, -90);

        const position5 = { x: 28, y: -0.5, z: 7.5 }; 
        const scale5 =  { x: 4.2, y: 4.2, z: 4.2 };
        loadmodelwithbase('./models/marvel/scene.gltf', position5, scale5, 180);

        const position6 = { x: 28, y: -0.5, z: 15 }; 
        const scale6 =  { x: 4.5, y: 4.5, z: 4.5 };
        loadmodelwithbase('./models/deadpool_fornite/scene.gltf', position6, scale6, -90);
        

        const position7 = { x: -28, y: 3, z: 15 }; 
        const scale7 =  { x: 3, y: 3, z: 3 };
        loadmodelwithbase('./models/loki/scene.gltf', position7, scale7, 90);

        const position8 = { x: -28, y: 3, z: 7.5 }; 
        const scale8 =  { x: 0.002, y: 0.002, z: 0.002 };
        loadmodelwithbase('./models/captain_america_shield/scene.gltf', position8, scale8, 60);

        const position9 = { x: -28, y: 3, z: 0 }; 
        const scale9 =  { x: 0.003, y: 0.003, z: 0.003 };
        loadmodelwithbase('./models/thors_hammer_mjolnir/scene.gltf', position9, scale9, 90);

        const position10 = { x: -28, y: 3, z: -7.5 }; 
        const scale10 =  { x: 0.0015, y: 0.0015, z: 0.0015 };
        loadmodelwithbase('./models/black/scene.gltf', position10, scale10, 135);

        const position11 = { x: -28, y: 2, z: -15 }; 
        const scale11 =  { x: 2, y: 2, z: 2 };
        loadmodelwithbase('./models/coracao/scene.gltf', position11, scale11, 90);

    

        // ************************** //
        // Add Paintings
        // ************************** //
       

        function addpaintingfront (path, posicao, rotacao){

            const paintingWidth = 12; 
            const paintingHeight = 7; 

            const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
            const frameGeometry = new THREE.BoxGeometry(12.5, 7.5, 0.00001);
            const paintingTexture = new THREE.TextureLoader().load(path);
            const paintingGeometry = new THREE.PlaneGeometry(paintingWidth, paintingHeight);
            const paintingMaterial = new THREE.MeshBasicMaterial({ map: paintingTexture, side: THREE.FrontSide });
            const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
            painting.position.set(posicao.x, posicao.y, posicao.z); 
            painting.rotation.y = THREE.MathUtils.degToRad(rotacao);
            scene.add(painting);
            

            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(posicao.x, posicao.y, (posicao.z-0.01));
            scene.add(frame);
        }

        function addpaintingback (path, posicao, rotacao){

            const paintingWidth = 12; 
            const paintingHeight = 7; 

            const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
            const frameGeometry = new THREE.BoxGeometry(12.5, 7.5, 0.00001);
            const paintingTexture = new THREE.TextureLoader().load(path);
            const paintingGeometry = new THREE.PlaneGeometry(paintingWidth, paintingHeight);
            const paintingMaterial = new THREE.MeshBasicMaterial({ map: paintingTexture, side: THREE.FrontSide });
            const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
            painting.position.set(posicao.x, posicao.y, posicao.z); 
            painting.rotation.y = THREE.MathUtils.degToRad(rotacao);
            scene.add(painting);


            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(posicao.x, posicao.y, (posicao.z+0.01));
            scene.add(frame);
            }
        
        const posicao1 = { x: -22, y: 4.5, z: -22.48 };
        addpaintingfront('./images/captain_america_1.jpg', posicao1, 0);

        const posicao2 = { x: -7.5, y: 4.5, z: -22.48 };
        addpaintingfront('./images/capitamarvel.jpg', posicao2, 0);

        const posicao3 = { x: 7.5, y: 4.5, z: -22.48 };
        addpaintingfront('./images/iron-man-1.jpg', posicao3, 0);

        const posicao4 = { x: 22, y: 4.5, z: -22.48 };
        addpaintingfront('./images/hulk.jpg', posicao4, 0);

        const posicao5 = { x: -22, y: 4.5, z: 22.48 };
        addpaintingback('./images/thor.jpg', posicao5, 180);

        const posicao6 = { x: -7.5, y: 4.5, z: 22.48 };
        addpaintingback('./images/spider.jpg', posicao6, 180);

        const posicao7 = { x: 7.5, y: 4.5, z: 22.48 };
        addpaintingback('./images/strange.jpg', posicao7, 180);

        const posicao8 = { x: 22, y: 4.5, z: 22.48 };
        addpaintingback('./images/guardioes.jpg', posicao8, 180);


        


        let render = function () {

        renderer.render(scene, camera);
        camera.position.copy(playerPos);

        window.addEventListener('resize', function() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = aspectRatio;
            camera.updateProjectionMatrix();
        })

        requestAnimationFrame(render);
        };

        render();