import loadSvg from '../lib/loadSvg.js';
import {MIN_Z} from '../lib/constants.js';

const renderSize = new THREE.Vector2();

const createBackgroundMesh = () => {
  const geometry = new THREE.PlaneBufferGeometry(1, 15);
  const material = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 1});
  return new THREE.Mesh(geometry, material);
}

const createCircleMesh = () => {
  const geometry = new THREE.CircleBufferGeometry(1, 32, Math.PI, 0.5 * Math.PI);
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
  return new THREE.Mesh(geometry, material);
};

const loadMeshes = async (scene) => {
  const background = createBackgroundMesh();
  background.visible = false;
  scene.add(background);

  const circleBackground = createCircleMesh();
  circleBackground.visible = false;
  scene.add(circleBackground);

  const circle = createCircleMesh();
  scene.add(circle);

  const exit = await loadSvg('observer/exit');
  scene.add(exit);

  return {
    background,
    circleBackground,
    circle,
    exit
  };
};

const calculateCircleScale = (renderer, progress) => {
  renderer.getSize(renderSize);
  return (70 + Math.sin(progress * Math.PI / 2) * 430) / renderSize.x;
}

const updatePositions = (renderer, camera, status, meshes) => {
  meshes.background.position.x = 0.5;
  meshes.background.position.y = 5;
  meshes.background.position.z = 0.2;

  const circleBackgroundScale = calculateCircleScale(renderer, 1);
  meshes.circleBackground.scale.x = circleBackgroundScale;
  meshes.circleBackground.scale.y = circleBackgroundScale;
  meshes.circleBackground.position.x = 1;
  meshes.circleBackground.position.y = camera.top;
  meshes.circleBackground.position.z = 0.2 + MIN_Z;

  const circleScale = calculateCircleScale(renderer, status.progress);
  meshes.circle.scale.x = circleScale;
  meshes.circle.scale.y = circleScale;
  meshes.circle.position.x = 1;
  meshes.circle.position.y = camera.top;
  meshes.circle.position.z = 0.2 + 2 * MIN_Z;

  const exitScale = 30 / renderSize.x;
  meshes.exit.scale.x = exitScale;
  meshes.exit.scale.y = exitScale;
  meshes.exit.position.x = 1 - exitScale * 0.9;
  meshes.exit.position.y = camera.top - exitScale * 0.3;
  meshes.exit.position.z = 0.2 + 3 * MIN_Z;
};

const intersect = (camera, meshes, point) => {
  const distanceX = 1 - point.x;
  const distanceY = camera.top - point.y;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  return distance < meshes.circle.scale.x;
};

const start = (camera, status, meshes, point) => {
  if (intersect(camera, meshes, point)) {
    status.action = 'STARTING';
    meshes.circleBackground.visible = true;
    meshes.background.visible = true;
  }
};

const progress = (renderer, status, meshes, elapsedTime) => {
  if (status.action === 'STARTING' || status.action === 'ABORTING') {
    status.progress += elapsedTime / 2000 * (status.action === 'ABORTING' ? -1 : 1);
    if (status.progress > 1) {
      status.progress = 1;
      status.action = 'DONE';
      window.location.reload();
    } else if (status.progress < 0) {
      status.progress = 0;
      status.action = 'WAITING';
      meshes.background.visible = false;
    }
    meshes.background.material.opacity = status.progress;
    const newScale = calculateCircleScale(renderer, status.progress);
    meshes.circle.scale.x = newScale;
    meshes.circle.scale.y = newScale;
  }
};

const abort = (status, meshes) => {
  status.action = 'ABORTING';
  meshes.circleBackground.visible = false;
};

const show = (meshes) => {
  meshes.circle.visible = true;
  meshes.exit.visible = true;
};

const hide = (meshes) => {
  meshes.circle.visible = false;
  meshes.exit.visible = false;
};

export default async (scene, renderer, camera) => {
  const status = {
    action: 'WAITING',
    progress: 0
  }

  const meshes = await loadMeshes(scene);
  updatePositions(renderer, camera, status, meshes);

  return {
    updatePositions: updatePositions.bind(null, renderer, camera, status, meshes),
    intersect: intersect.bind(null, camera, meshes),
    start: start.bind(null, camera, status, meshes),
    progress: progress.bind(null, renderer, status, meshes),
    abort: abort.bind(null, status, meshes),
    show: show.bind(null, meshes),
    hide: hide.bind(null, meshes)
  };
}