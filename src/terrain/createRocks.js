import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';
import getTerrainInfoAtPoint from './getTerrainInfoAtPoint.js';

const MIN_ROCK_SLOPE = 0.5;

export default async (scene, terrainMesh, maxHeight) => {
  const meshes = [
    await createInstancedObjectFromSvg(scene, 'rocks/lime'),
    await createInstancedObjectFromSvg(scene, 'rocks/basalt')
  ]
  const rocks = [];
  const testPoint = new THREE.Vector2();
  for (let i = 0; i < 1000; i++) {
    testPoint.x = Math.random();
    testPoint.y = Math.random() * maxHeight;
    const terrainInfo = getTerrainInfoAtPoint(terrainMesh, maxHeight, testPoint);
    if (terrainInfo) {
      if (terrainInfo.slope > MIN_ROCK_SLOPE) {
        const rock = meshes[Math.floor(Math.random() * meshes.length)].addInstance();
        const scale = 0.03 - Math.random() * terrainInfo.slope / MIN_ROCK_SLOPE * 0.02;
        rock.scale.x = scale;
        rock.scale.y = 0;
        rock.position.copy(terrainInfo.point);
        rock.position.y -= scale;
        rock.userData = {
          scale,
          baseY: rock.position.y
        };
        rocks.push(rock);
      }
    }
  }
  return movement => {
    rocks.forEach(rock => {
      rock.scale.y = rock.userData.scale * movement;
      rock.position.y = rock.userData.baseY + rock.userData.scale * 1.5 * movement;
      rock.update();
    });
  }
};