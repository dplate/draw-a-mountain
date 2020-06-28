import loadSvg from '../lib/loadSvg.js';
import getConstructionAudio from '../lib/getConstructionAudio.js';
import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';
import getRandomFromList from '../lib/getRandomFromList.js';
import setOpacity from '../lib/setOpacity.js';

export default async (scene, sound) => {
  const constructionAudio = await getConstructionAudio(sound);
  const fireAudio = await sound.loadAudio('fireplace/fire');
  fireAudio.setLoop(true);

  const fireplace = await loadSvg('fireplace/fireplace');
  fireplace.visible = false;
  fireplace.geometry.translate(0, 0.2, 0);
  fireplace.add(constructionAudio);
  fireplace.add(fireAudio);
  scene.add(fireplace);

  const woodBack = await loadSvg('fireplace/wood-back');
  woodBack.visible = false;
  woodBack.geometry.translate(0, 0.3, 0);
  scene.add(woodBack);

  const fire = await loadSvg('fireplace/fire');
  fire.visible = false;
  fire.geometry.translate(0, 0.3, 0);
  fire.userData = {
    status: 'burned',
    strength: 0,
    flicker: 0
  };
  scene.add(fire);

  const woodFront = await loadSvg('fireplace/wood-front');
  woodFront.visible = false;
  woodFront.geometry.translate(0, 0.3, 0);
  scene.add(woodFront);

  const instancedStones = [
    await createInstancedObjectFromSvg(scene, 'fireplace/stone-1'),
    await createInstancedObjectFromSvg(scene, 'fireplace/stone-2'),
    await createInstancedObjectFromSvg(scene, 'fireplace/stone-3')
  ]
  const stones = [];
  for (let i = 0; i < 12; i++) {
    stones.push(getRandomFromList(instancedStones).addInstance());
  }
  instancedStones.forEach(instancedStone => instancedStone.mesh.visible = false);

  const instancedStump = await createInstancedObjectFromSvg(scene, 'fireplace/stump');
  const instancedSausage = await createInstancedObjectFromSvg(scene, 'fireplace/sausage');
  const stumps = [];
  const sausages = [];
  for (let i = 0; i < 4; i++) {
    stumps.push(instancedStump.addInstance());
    sausages.push(instancedSausage.addInstance());
  }
  instancedStump.mesh.visible = false;
  instancedSausage.mesh.visible = false;

  const instancedSpark = await createInstancedObjectFromSvg(scene, 'fireplace/spark');
  const sparks = [];
  for (let i = 0; i < 40; i++) {
    const spark = instancedSpark.addInstance();
    spark.userData.lifeTime = 0;
    spark.userData.lifeTimeSpeed = 0;
    spark.userData.speed = 0;
    spark.userData.mirror = 1;
    sparks.push(spark);
  }
  instancedSpark.mesh.visible = false;
  setOpacity(instancedSpark.mesh, 0.5);

  const navigationData = {
    fireplacePoint: null,
    fireplacePreparationPoint: null,
    entranceTerrainInfo: null,
    seats: [],
  };

  return {
    constructionAudio,
    fireAudio,
    fireplace,
    woodBack,
    fire,
    woodFront,
    instancedStones,
    stones,
    instancedStump,
    stumps,
    instancedSausage,
    sausages,
    instancedSpark,
    sparks,
    navigationData
  };
}