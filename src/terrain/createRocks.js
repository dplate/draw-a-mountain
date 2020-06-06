import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const MIN_ROCK_SLOPE = 0.8;

export default async (scene, terrainMesh) => {
  const meshes = [
    await createInstancedObjectFromSvg(scene, 'rocks/lime'),
    await createInstancedObjectFromSvg(scene, 'rocks/basalt')
  ]
  const terrainGeometry = new THREE.Geometry().fromBufferGeometry(terrainMesh.geometry);
  const vertices = terrainGeometry.vertices;
  const rocks = [];
  terrainGeometry.faces.forEach(face => {
    if (face.normal.y < MIN_ROCK_SLOPE && Math.random() * MIN_ROCK_SLOPE > face.normal.y && Math.random() < 0.5) {
      const rock = meshes[Math.floor(Math.random() * meshes.length)].addInstance();
      const scale = 0.03 - Math.random() * face.normal.y / MIN_ROCK_SLOPE * 0.02;
      rock.scale.x = scale;
      rock.scale.y = 0;
      rock.position.x = (vertices[face.a].x + vertices[face.b].x + vertices[face.c].x) / 3;
      rock.position.y = (vertices[face.a].y + vertices[face.b].y + vertices[face.c].y) / 3 - scale;
      rock.position.z = (vertices[face.a].z + vertices[face.b].z + vertices[face.c].z) / 3;
      rock.userData = {
        scale,
        baseY: rock.position.y
      };
      rocks.push(rock);
    }
  });
  terrainGeometry.dispose();
  return movement => {
    rocks.forEach(rock => {
      rock.scale.y = rock.userData.scale * movement;
      rock.position.y = rock.userData.baseY + rock.userData.scale * 1.5 * movement;
      rock.update();
    });
  }
};