const getRandomPart = (list) => list[Math.floor(Math.random() * list.length)];

export default (scene, parts) => {
  const body = getRandomPart(parts.bodies);
  const head = getRandomPart(parts.heads);
  const leg = getRandomPart(parts.legs.filter(leg => leg.color === body.legColor));
  const arm = getRandomPart(parts.arms.filter(arm => arm.color === body.armColor));

  const person = {
    body: {
      meshes: {
        left: body.meshes.left.clone()
      }
    },
    head: {
      meshes: {
        left: head.meshes.left.clone()
      }
    },
    leg: {
      meshes: {
        left: {
          front: leg.meshes.left.front.clone(),
          back: leg.meshes.left.back.clone()
        }
      }
    },
    arm: {
      meshes: {
        left: {
          front: arm.meshes.left.front.clone(),
          back: arm.meshes.left.back.clone()
        }
      }
    },
    position: new THREE.Vector3(0.5, 0.1, 0),
    scale: 1
  };

  scene.add(person.arm.meshes.left.back);
  scene.add(person.leg.meshes.left.back);
  scene.add(person.body.meshes.left);
  scene.add(person.head.meshes.left);
  scene.add(person.arm.meshes.left.front);
  scene.add(person.leg.meshes.left.front);

  return person;
};