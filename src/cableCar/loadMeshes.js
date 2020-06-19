import loadSvg from '../lib/loadSvg.js';
import getConstructionAudio from '../lib/getConstructionAudio.js';

export default async (scene, sound) => {
  const stationTop = await loadSvg('cableCar/station-top');
  stationTop.visible = false;
  stationTop.userData.constructionAudio = await getConstructionAudio(sound);
  stationTop.add(stationTop.userData.constructionAudio);
  scene.add(stationTop);

  const support1 = await loadSvg('cableCar/support');
  support1.visible = false;
  const supports = [support1, support1.clone(), support1.clone()];
  supports.forEach(support => scene.add(support));

  const cableMaterial = new THREE.LineBasicMaterial({color: new THREE.Color(0x555555)});
  const primaryCable = new THREE.Line(new THREE.BufferGeometry(), cableMaterial);
  primaryCable.visible = false;
  scene.add(primaryCable);

  const secondaryCable = new THREE.Line(new THREE.BufferGeometry(), cableMaterial);
  secondaryCable.visible = false;
  scene.add(secondaryCable);

  const car = await loadSvg('cableCar/car');
  car.visible = false;
  car.userData.direction = -1;
  car.userData.waitTimeLeft = 1000;
  car.userData.trackPosition = 1;
  car.userData.maxCapacity = 4;
  car.userData.usedCapacity = 0;
  car.userData.ringAudio = await sound.loadAudio('cableCar/ring');
  car.add(car.userData.ringAudio);
  car.userData.passAudio = await sound.loadAudio('cableCar/pass');
  car.add(car.userData.passAudio);
  car.userData.whooAudio = await sound.loadAudio('cableCar/whoo');
  car.add(car.userData.whooAudio);
  scene.add(car);

  const stationBottom = await loadSvg('cableCar/station-bottom');
  stationBottom.visible = false;
  stationBottom.position.x = 0.5;
  scene.add(stationBottom);

  return {
    stationTop,
    supports,
    primaryCable,
    secondaryCable,
    car,
    stationBottom
  };
}