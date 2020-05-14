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

  const demoPersons = [];
  for (let i = 0; i < 50; i++) {
    const terrainInfo = findNearestTerrain(terrain, new THREE.Vector3(Math.random(), Math.random() * 0.2, Math.random()));
    if (terrainInfo) {
      const person = persons.add();
      person.position.copy(terrainInfo.point)
      person.animation = 'walking';
      person.direction = Math.random() < 0.5 ? 'right' : 'left';
      if (i === 0) person.scale = 5;
      demoPersons.push(person);
    }
  }
  dispatcher.listen('demoPersons', 'animate', ({elapsedTime}) => {
    demoPersons.forEach(person => {
      if (person.direction === 'left') {
        person.position.x -= elapsedTime * 0.000003 * person.scale;
        if (person.position.x < 0) {
          person.direction = 'right';
        }
      } else if (person.direction === 'right') {
        person.position.x += elapsedTime * 0.000003 * person.scale;
        if (person.position.x > 1) {
          person.direction = 'left';
        }
      }
      const terrainInfo = terrain.getTerrainInfoAtPoint(person.position, true);
      if (terrainInfo) {
        person.position.y = terrainInfo.point.y;
      }
    });
  });

}

start();