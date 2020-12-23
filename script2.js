import * as THREE from 'https://unpkg.com/three@0.122.0//build/three.module.js';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js';
import {
  GUI
} from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/dat.gui.module.js';

import {
  GLTFLoader
} from 'https://unpkg.com/three@0.122.0/examples/jsm/loaders/GLTFLoader.js';

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;

const crossFadeControls = [];

let applauseAction, doneAction, hiAction;
let meetAction, pleaseAction, respectAction, tPose;
let idleWeight, walkWeight, runWeight;
let actions, settings;

let singleStepMode = false;
let sizeOfNextStep = 0;

init();

function init() {

  const container = document.getElementById('container');
  idleWeight = 1;

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(1, 2, -3);
  camera.lookAt(0, 1, 0);

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

  // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

  // ground

  const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), new THREE.MeshPhongMaterial({
    color: 0x999999,
    depthWrite: false
  }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const loader = new GLTFLoader();
  loader.load('Signs.glb', function(gltf) {

    model = gltf.scene;
    model.rotateY( Math.PI  );
    scene.add(model);

    model.traverse(function(object) {

      if (object.isMesh) object.castShadow = true;

    });

    //

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    const animations = gltf.animations;

    mixer = new THREE.AnimationMixer(model);

    applauseAction = mixer.clipAction(animations[0]);//
    doneAction = mixer.clipAction(animations[1]);//
    hiAction = mixer.clipAction(animations[2]);//
    meetAction = mixer.clipAction(animations[3]);//
    pleaseAction = mixer.clipAction(animations[4]);//
    respectAction = mixer.clipAction(animations[5]);
    tPose = mixer.clipAction(animations[6]);//
    //runAction = mixer.clipAction(animations[1]);

    ///actions = [idleAction, walkAction, runAction];
      actions = [tPose];
    activateAllActions();

    animate();

  });

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize, false);

}


function showModel(visibility) {

  model.visible = visibility;

}


function showSkeleton(visibility) {

  skeleton.visible = visibility;

}


function modifyTimeScale(speed) {

  mixer.timeScale = speed;

}


function deactivateAllActions() {

  actions.forEach(function(action) {

    action.stop();

  });

}

function activateAllActions() {

// setWeight(idleAction, settings['modify idle weight']);
// setWeight(walkAction, settings['modify walk weight']);
// setWeight(runAction, settings['modify run weight']);
setWeight(actions[0], 1);

  actions.forEach(function(action) {

    action.play();

  });

}

function pauseContinue() {

  if (singleStepMode) {

    singleStepMode = false;
    unPauseAllActions();

  } else {

    if (idleAction.paused) {

      unPauseAllActions();

    } else {

      pauseAllActions();

    }

  }

}

function pauseAllActions() {

  actions.forEach(function(action) {

    action.paused = true;

  });

}

function unPauseAllActions() {

  actions.forEach(function(action) {

    action.paused = false;

  });

}

function setWeight(action, weight) {

  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}
function send(input) {
  input = input.toLowerCase();
  if(input=='hi'||input=='bye'||input=='hello'||input=='goodbye'){
    deactivateAllActions();
    actions = [hiAction];
    activateAllActions();
  }
   else if(input=='please'||input=='my pleasure') {
     deactivateAllActions();
     actions = [pleaseAction];
     activateAllActions();
  }
  else if(input=='nice to meet you'||input=='greetings'){
    deactivateAllActions();
    actions = [meetAction];
    activateAllActions();
  }
  else if(input=='well done'||input=='good job'|| input=='nice job'|| input=='great'||input=='amazing'){
    deactivateAllActions();
    actions = [doneAction];
    activateAllActions();
  }
  else if(input=='applause'||input=='silent applause'){
    deactivateAllActions();
    actions = [applauseAction];
    activateAllActions();
  }
  else if(input=='respect'){
    deactivateAllActions();
    actions = [respectAction];
    activateAllActions();
  }
  else if(input==''){
    deactivateAllActions();
    actions = [tPose];
    activateAllActions();
  }
  else{
    alert("That wasn't a word we know yet! Sorry.")
    deactivateAllActions();
    actions = [tPose];
    activateAllActions();
  }
  document.getElementById("words").value = ''
}

function animate() {

  // Render loop

  requestAnimationFrame(animate);
  document.getElementById("send_button").onclick = function() {
    send(document.getElementById("words").value);
  };

  //idleWeight = idleAction.getEffectiveWeight();
  //walkWeight = walkAction.getEffectiveWeight();
  //runWeight = runAction.getEffectiveWeight();

  // Update the panel values if weights are modified from "outside" (by crossfadings)

  //updateWeightSliders();

  // Enable/disable crossfade controls according to current weight values

//  updateCrossFadeControls();

  // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

  let mixerUpdateDelta = clock.getDelta();

  // If in single step mode, make one step and then do nothing (until the user clicks again)

  if (singleStepMode) {

    mixerUpdateDelta = sizeOfNextStep;
    sizeOfNextStep = 0;

  }

  // Update the animation mixer, the stats panel, and render this frame

  mixer.update(mixerUpdateDelta);

  stats.update();

  renderer.render(scene, camera);

}
