import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from "three/addons/libs/stats.module.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";



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
        // Add Player Position
        // ************************** //
        const playerPos = new THREE.Vector3(0, 3, 5);



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
        const planeGeometry = new THREE.PlaneGeometry(45, 45);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide});
        const floorPlane = new THREE.Mesh(planeGeometry, planeMaterial); 

        floorPlane.rotation.x = Math.PI / 2; 
        floorPlane.position.y = -Math.PI; 
        scene.add(floorPlane);

        // ************************** //
        // Add Ceiling
        // ************************** //
        const planeGeometry2 = new THREE.PlaneGeometry(45, 45); 
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


        const planeGeo = new THREE.PlaneGeometry(45, 45);
        const planeMat = new THREE.MeshBasicMaterial({map: wallsTexture,side: THREE.DoubleSide});


        // Front Wall
        const frontWall = new THREE.Mesh(planeGeo,planeMat);
        frontWall.position.z = -22.5; 

        // Back Wall
        const backWall = new THREE.Mesh(planeGeo,planeMat);
        backWall.position.z = 22.5; 


        // Left Wall
        const leftWall = new THREE.Mesh(planeGeo,planeMat);
        leftWall.rotation.y = Math.PI / 2; 
        leftWall.position.x = -22.5; 

        // Right Wall
        const rightWall = new THREE.Mesh(planeGeo,planeMat);
        rightWall.position.x = 22.5;
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

                const poslamp = { x: posicao.x, y: 11.8, z: posicao.z };
                loadmodel('./models/ceiling_light/scene.gltf', poslamp, { x: 1, y: 1, z: 1 }, rotacao);

            }
        );
        }

      
        const position1 = { x: 20.5, y: -0.5, z: -15 }; 
        const scale1 =  { x: 0.0038, y: 0.0038, z: 0.0038 };
        loadmodelwithbase('./models/iron_man/scene.gltf', position1, scale1, -90);
        const ambientLight1 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight1.position.copy(position1);
        scene.add(ambientLight1);
        const texture = textureLoader.load('./images/irontext.png');
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.PlaneGeometry(1, 1); 
        const figureMesh = new THREE.Mesh(geometry, material);
        const figurePosition = { x: 18.3, y: -1.7, z: -15 };
        const figureScale = { x: 3, y: 1, z: 3 };
        figureMesh.position.copy(figurePosition);
        figureMesh.scale.copy(figureScale);
        figureMesh.rotation.y = THREE.MathUtils.degToRad(-90);
        scene.add(figureMesh);

        
        const position2 = { x: 20.5, y: -0.5, z: -7.5 }; 
        const scale2 =  { x: 0.052, y: 0.052, z: 0.052 };
        loadmodelwithbase('./models/spider/scene.gltf', position2, scale2, -90);
        const ambientLight2 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight2.position.copy(position2);
        scene.add(ambientLight2);
        const texture2 = textureLoader.load('./images/spidertext.png');
        const material2 = new THREE.MeshBasicMaterial({ map: texture2 });
        const geometry2 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh2 = new THREE.Mesh(geometry2, material2);
        const figurePosition2 = { x: 18.3, y: -1.7, z: -7.5 };
        const figureScale2 = { x: 3.2, y: 1, z: 3.2 };
        figureMesh2.position.copy(figurePosition2);
        figureMesh2.scale.copy(figureScale2);
        figureMesh2.rotation.y = THREE.MathUtils.degToRad(-90);
        scene.add(figureMesh2);

        const position3 = { x: 20.5, y: -0.5, z: 0 }; 
        const scale3 =  { x: 4, y: 4, z: 4 };
        loadmodelwithbase('./models/rocket/scene.gltf', position3, scale3, 170);
        const ambientLight3 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight3.position.copy(position3);
        scene.add(ambientLight3);
        const texture3 = textureLoader.load('./images/rato.png');
        const material3 = new THREE.MeshBasicMaterial({ map: texture3 });
        const geometry3 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh3 = new THREE.Mesh(geometry3, material3);
        const figurePosition3 = { x: 18.3, y: -1.7, z: 0 };
        const figureScale3 = { x: 2.5, y: 2, z: 2.5 };
        figureMesh3.position.copy(figurePosition3);
        figureMesh3.scale.copy(figureScale3);
        figureMesh3.rotation.y = THREE.MathUtils.degToRad(-90);
        scene.add(figureMesh3);

        const position4 = { x: 19.5, y: -0.5, z: 0 };
        const scale4 =  { x: 400, y: 400, z: 400 };
        loadmodel('./models/groot/scene.gltf', position4, scale4, -90);
        const ambientLight4 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight4.position.copy(position4);
        scene.add(ambientLight4);

        const position5 = { x: 20.5, y: -0.5, z: 7.5 }; 
        const scale5 =  { x: 4.2, y: 4.2, z: 4.2 };
        loadmodelwithbase('./models/marvel/scene.gltf', position5, scale5, 180);
        const ambientLight5 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight5.position.copy(position5);
        scene.add(ambientLight5);
        const texture4 = textureLoader.load('./images/marvel1.png');
        const material4 = new THREE.MeshBasicMaterial({ map: texture4 });
        const geometry4 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh4 = new THREE.Mesh(geometry4, material4);
        const figurePosition4 = { x: 18.2, y: -1.7, z: 7.5 };
        const figureScale4 = { x: 2.5, y: 1.5, z: 2.5 };
        figureMesh4.position.copy(figurePosition4);
        figureMesh4.scale.copy(figureScale4);
        figureMesh4.rotation.y = THREE.MathUtils.degToRad(-90);
        scene.add(figureMesh4);

        const position6 = { x: 20.5, y: -0.5, z: 15 }; 
        const scale6 =  { x: 4.5, y: 4.5, z: 4.5 };
        loadmodelwithbase('./models/deadpool_fornite/scene.gltf', position6, scale6, -90);
        const ambientLight6 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight6.position.copy(position6);
        scene.add(ambientLight6);
        const texture6 = textureLoader.load('./images/deadpool.png');
        const material6 = new THREE.MeshBasicMaterial({ map: texture6 });
        const geometry6 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh6 = new THREE.Mesh(geometry6, material6);
        const figurePosition6 = { x: 18.2, y: -1.7, z: 15 };
        const figureScale6 = { x: 3, y: 1.5, z: 3 };
        figureMesh6.position.copy(figurePosition6);
        figureMesh6.scale.copy(figureScale6);
        figureMesh6.rotation.y = THREE.MathUtils.degToRad(-90);
        scene.add(figureMesh6);
        

        const position7 = { x: -20.5, y: 3, z: 15 }; 
        const scale7 =  { x: 3, y: 3, z: 3 };
        loadmodelwithbase('./models/loki/scene.gltf', position7, scale7, 90);
        const ambientLight7 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight7.position.copy(position7);
        scene.add(ambientLight7);
        const texture7 = textureLoader.load('./images/loki.png');
        const material7 = new THREE.MeshBasicMaterial({ map: texture7 });
        const geometry7 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh7 = new THREE.Mesh(geometry7, material7);
        const figurePosition7 = { x: -18.2, y: -1.7, z: 15 };
        const figureScale7 = { x: 3, y: 1.5, z: 3 };
        figureMesh7.position.copy(figurePosition7);
        figureMesh7.scale.copy(figureScale7);
        figureMesh7.rotation.y = THREE.MathUtils.degToRad(90);
        scene.add(figureMesh7);

        const position8 = { x: -20.5, y: 3, z: 7.5 }; 
        const scale8 =  { x: 0.002, y: 0.002, z: 0.002 };
        loadmodelwithbase('./models/captain_america_shield/scene.gltf', position8, scale8, 60);
        const ambientLight8 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight8.position.copy(position8);
        scene.add(ambientLight8);
        const texture8 = textureLoader.load('./images/shield.png');
        const material8 = new THREE.MeshBasicMaterial({ map: texture8 });
        const geometry8 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh8 = new THREE.Mesh(geometry8, material8);
        const figurePosition8 = { x: -18.2, y: -1.7, z: 7.5 };
        const figureScale8 = { x: 3, y: 2, z: 3 };
        figureMesh8.position.copy(figurePosition8);
        figureMesh8.scale.copy(figureScale8);
        figureMesh8.rotation.y = THREE.MathUtils.degToRad(90);
        scene.add(figureMesh8);

        const position9 = { x: -20.5, y: 3, z: 0 }; 
        const scale9 =  { x: 0.003, y: 0.003, z: 0.003 };
        loadmodelwithbase('./models/thors_hammer_mjolnir/scene.gltf', position9, scale9, 90);
        const ambientLight9 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight9.position.copy(position9);
        scene.add(ambientLight9);
        const texture9 = textureLoader.load('./images/hammer.png');
        const material9 = new THREE.MeshBasicMaterial({ map: texture9 });
        const geometry9 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh9 = new THREE.Mesh(geometry9, material9);
        const figurePosition9 = { x: -18.2, y: -1.7, z: 0 };
        const figureScale9 = { x: 3, y: 1.5, z: 3 };
        figureMesh9.position.copy(figurePosition9);
        figureMesh9.scale.copy(figureScale9);
        figureMesh9.rotation.y = THREE.MathUtils.degToRad(90);
        scene.add(figureMesh9);

        const position10 = { x: -20.5, y: 3, z: -7.5 }; 
        const scale10 =  { x: 0.002, y: 0.002, z: 0.002 };
        loadmodelwithbase('./models/black/scene.gltf', position10, scale10, 135);
        const ambientLight10 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight10.position.copy(position10);
        scene.add(ambientLight10);
        const texture10 = textureLoader.load('./images/mask.png');
        const material10 = new THREE.MeshBasicMaterial({ map: texture10 });
        const geometry10 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh10 = new THREE.Mesh(geometry10, material10);
        const figurePosition10 = { x: -18.2, y: -1.7, z: -7.5 };
        const figureScale10 = { x: 3, y: 2, z: 3 };
        figureMesh10.position.copy(figurePosition10);
        figureMesh10.scale.copy(figureScale10);
        figureMesh10.rotation.y = THREE.MathUtils.degToRad(90);
        scene.add(figureMesh10);

        const position11 = { x: -20.5, y: 2, z: -15 }; 
        const scale11 =  { x: 2, y: 2, z: 2 };
        loadmodelwithbase('./models/coracao/scene.gltf', position11, scale11, 90);
        const ambientLight11 = new THREE.DirectionalLight(0x000000, 1);
        ambientLight11.position.copy(position11);
        scene.add(ambientLight11);
        const texture11 = textureLoader.load('./images/arc.png');
        const material11 = new THREE.MeshBasicMaterial({ map: texture11 });
        const geometry11 = new THREE.PlaneGeometry(1, 1); 
        const figureMesh11 = new THREE.Mesh(geometry11, material11);
        const figurePosition11 = { x: -18.2, y: -1.7, z: -15 };
        const figureScale11 = { x: 3, y: 2, z: 3 };
        figureMesh11.position.copy(figurePosition11);
        figureMesh11.scale.copy(figureScale11);
        figureMesh11.rotation.y = THREE.MathUtils.degToRad(90);
        scene.add(figureMesh11);


          // Variável para controlar o estado da luz
          var isLightOn = false;
         
  
          // Função para alternar o estado da luz
          function toggleLight() {
              isLightOn = !isLightOn;
              ambientLight1.visible = !isLightOn;
              ambientLight2.visible = !isLightOn;
              ambientLight3.visible = !isLightOn;
              ambientLight4.visible = !isLightOn;
              ambientLight5.visible = !isLightOn;
              ambientLight6.visible = !isLightOn;
              ambientLight7.visible = !isLightOn;
              ambientLight8.visible = !isLightOn;
              ambientLight9.visible = !isLightOn;
              ambientLight10.visible = !isLightOn;
              ambientLight11.visible = !isLightOn;
              ambientLight.visible = !isLightOn;
          }

          document.addEventListener('keydown', function (event) {
            if (event.key === 'L' || event.key === 'l') {
                toggleLight();
            }
        });
        
    

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
        
        const posicao1 = { x: -15, y: 4.5, z: -22.48 };
        addpaintingfront('./images/captain_america_1.jpg', posicao1, 0);

        const posicao2 = { x: 0, y: 4.5, z: -22.48 };
        addpaintingfront('./images/capitamarvel.jpg', posicao2, 0);

        const posicao4 = { x: 15, y: 4.5, z: -22.48 };
        addpaintingfront('./images/hulk.jpg', posicao4, 0);

        const posicao5 = { x: -15, y: 4.5, z: 22.48 };
        addpaintingback('./images/thor.jpg', posicao5, 180);

        const posicao6 = { x: -0, y: 4.5, z: 22.48 };
        addpaintingback('./images/spider.jpg', posicao6, 180);

        const posicao7 = { x: 15, y: 4.5, z: 22.48 };
        addpaintingback('./images/strange.jpg', posicao7, 180);



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