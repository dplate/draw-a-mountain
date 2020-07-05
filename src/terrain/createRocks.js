import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const MIN_ROCK_SLOPE = 0.045;

export default async (scene, terrainMesh) => {
  const meshes = [
    await createInstancedObjectFromSvg(scene, 'rocks/lime'),
    await createInstancedObjectFromSvg(scene, 'rocks/lime2'),
    await createInstancedObjectFromSvg(scene, 'rocks/basalt'),
    await createInstancedObjectFromSvg(scene, 'rocks/basalt2'),
    await createInstancedObjectFromSvg(scene, 'rocks/granite'),
    await createInstancedObjectFromSvg(scene, 'rocks/granite2')
  ]
  const terrainGeometry = new THREE.Geometry().fromBufferGeometry(terrainMesh.geometry);
  const vertices = terrainGeometry.vertices;
  const rocks = [];
  terrainGeometry.faces.forEach(face => {
    const pointA = vertices[face.a];
    const pointB = vertices[face.b];
    const pointC = vertices[face.c];
    const slope = Math.max(Math.abs(pointA.y - pointB.y) + Math.abs(pointA.y - pointC.y) + Math.abs(pointB.y - pointC.y))
    if (slope > MIN_ROCK_SLOPE && Math.random() < 0.5) {
      const rock = meshes[Math.floor(Math.random() * meshes.length)].addInstance();
      const scale = Math.min(0.01 + Math.random() * slope, 0.03);
      rock.scale.x = scale;
      rock.scale.y = 0;
      rock.position.x = (pointA.x + pointB.x + pointC.x) / 3;
      rock.position.y = (pointA.y + pointB.y + pointC.y) / 3 - scale;
      rock.position.z = (pointA.z + pointB.z + pointC.z) / 3;
      rock.userData = {
        scale,
        baseY: rock.position.y
      };
      rocks.push(rock);
    }
  });

  return movement => {
    rocks.forEach(rock => {
      rock.scale.y = rock.userData.scale * movement;
      rock.position.y = rock.userData.baseY + rock.userData.scale * 1.5 * movement;
      rock.update();
    });
  }
};