import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";
import addMenu from "./menu/addMenu.js";
import addSmoke from "./particles/addSmoke.js";
import addPaths from "./paths/addPaths.js";
import addRestaurant from "./restaurant/addRestaurant.js";
import addCableCar from "./cableCar/addCableCar.js";
import addTrees from "./trees/addTrees.js";
import addPersons from "./persons/addPersons.js";
import findNearestTerrain from "./lib/findNearestTerrain.js";
import getPersonDirection from "./lib/getPersonDirection.js";

const start = async () => {
  const {scene, camera, dispatcher} = setup(window);

  const menu = await addMenu(scene, camera, dispatcher);
  const smoke = await addSmoke(scene, dispatcher);
  addEnvironment(scene, dispatcher);
  const terrain = await addTerrain(scene, dispatcher);
  const trees = await addTrees(scene, dispatcher, menu, terrain);
  const restaurant = await addRestaurant(scene, menu, smoke, terrain, dispatcher);
  const cableCar = await addCableCar(scene, menu, smoke, terrain, trees, dispatcher);
  await addPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  const persons = await addPersons(scene, dispatcher);

  const newRandomPosition = () => {
    while (1) {
      const terrainInfo = findNearestTerrain(terrain, new THREE.Vector3(Math.random(), Math.random() * 0.2, Math.random()));
      if (terrainInfo) {
        return terrainInfo.point;
      }
    }
  };
  const demoPersons = [];
  for (let i = 0; i < 100; i++) {
    const person = persons.add();
    person.position.copy(newRandomPosition())
    person.animation = 'walking';
    person.direction = Math.random() < 0.5 ? 'right' : 'left';
    person.target = newRandomPosition();
    if (i === 0) person.scale = 5;
    demoPersons.push(person);
  }
  dispatcher.listen('demoPersons', 'animate', ({elapsedTime}) => {
    demoPersons.forEach(person => {
      const directionVector = person.target.clone();
      directionVector.sub(person.position);
      if (directionVector.length() < 0.001) {
        person.target = newRandomPosition();
      } else {
        directionVector.normalize();
        directionVector.z *= 10;
        directionVector.multiplyScalar(elapsedTime * 0.000003 * person.scale);
        person.position.add(directionVector);
      }
      const terrainInfo = terrain.getTerrainInfoAtPoint(person.position, true);
      if (terrainInfo) {
        person.position.y = terrainInfo.point.y;
      }
      person.direction = getPersonDirection(person.position, person.target);
    });
  });

}

start();