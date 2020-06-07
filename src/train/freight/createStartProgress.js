import removeMesh from '../../lib/removeMesh.js';

export default (scene) => {
  const arrows = new THREE.Group();
  const geometry = new THREE.CircleBufferGeometry(0.01, 3);
  const gray = new THREE.MeshBasicMaterial({color: 0xbbbbbb, opacity: 0.5, transparent: true});
  const green = new THREE.MeshBasicMaterial({color: 0x00bb00, opacity: 0.5, transparent: true});
  for (let i = 0; i < 13; i++) {
    const arrow = new THREE.Mesh(geometry, gray);
    arrow.position.x = 0.83 + 0.013 * i;
    arrow.position.y = 0.01;
    arrow.position.z = 0.09;
    arrows.add(arrow);
  }
  arrows.visible = false
  arrows.name = 'startProgress';
  scene.add(arrows);

  const startProgress = {
    progress: 0
  }

  startProgress.update = () => {
    if (startProgress.progress > 0) {
      arrows.visible = true;
      arrows.children.forEach((arrow, index) => {
        if (index < arrows.children.length * startProgress.progress) {
          arrow.material = green;
        } else {
          arrow.material = gray;
        }
      });
    } else {
      arrows.visible = false;
    }
  };

  startProgress.remove = () => {
    removeMesh(scene, arrows);
  };

  return startProgress;
};