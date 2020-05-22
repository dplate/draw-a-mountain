const BODY_SCALE = 0.005;
const HEAD_SCALE = 0.005;
const ARM_SCALE = 0.0035;
const LEG_SCALE = 0.004;

const OFFSET_Y = 0.001;

const MIN_OFFSET_Z = 0.0001;

const zAxis = new THREE.Vector3(0, 0, 1);

const updateMeshes = (meshes, direction, updateMesh) => {
  Object.keys(meshes).forEach(meshDirection => {
    const mesh = meshes[meshDirection];
    if (meshDirection === direction) {
      updateMesh(mesh);
      mesh.visible = true;
    } else {
      mesh.visible = false;
    }
  })
};

const updateBody = (body, position, direction, scale) => {
  updateMeshes(body.meshes, direction, (mesh) => {
    mesh.scale.x = BODY_SCALE * scale;
    mesh.scale.y = BODY_SCALE * scale;
    mesh.position.copy(position);
    mesh.position.y += (BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
  });
};

const updateHead = (head, position, direction, scale) => {
  updateMeshes(head.meshes, direction, (mesh) => {
    mesh.scale.x = HEAD_SCALE * scale;
    mesh.scale.y = HEAD_SCALE * scale;
    mesh.position.copy(position);
    switch (direction) {
      case 'left':
        mesh.position.x -= HEAD_SCALE * 0.1 * scale;
        break;
      case 'right':
        mesh.position.x += HEAD_SCALE * 0.1 * scale;
        break;
    }
    mesh.position.y += (HEAD_SCALE * 0.8 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
  });
};

const updateArm = (arm, side, position, direction, scale) => {
  updateMeshes(arm.meshes, direction, (mesh) => {
    mesh.scale.x = ARM_SCALE * scale;
    mesh.scale.y = ARM_SCALE * scale;
    mesh.position.copy(position);
    switch (direction) {
      case 'left':
      case 'right':
        mesh.setRotationFromAxisAngle(zAxis, (direction === 'right' ? -1 : 1) * arm.angle);
        mesh.position.y += (-ARM_SCALE * 0.3 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
        if (direction === side) {
          mesh.position.z += 2 * MIN_OFFSET_Z;
        } else {
          mesh.position.z -= 2 * MIN_OFFSET_Z;
        }
        break;
      case 'front':
        mesh.scale.y *= Math.cos(arm.angle) * Math.cos(arm.angle);
        if (side === 'left') {
          mesh.setRotationFromAxisAngle(zAxis, arm.angle / 3);
          mesh.position.x += ARM_SCALE * 0.48 * scale;
        } else {
          mesh.setRotationFromAxisAngle(zAxis, -arm.angle / 3);
          mesh.position.x -= ARM_SCALE * 0.48 * scale;
        }
        mesh.position.y += (-ARM_SCALE * 0.2 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
        mesh.position.z += 2 * MIN_OFFSET_Z;
        break;
      case 'back':
        mesh.scale.y *= Math.cos(arm.angle) * Math.cos(arm.angle);
        if (side === 'right') {
          mesh.setRotationFromAxisAngle(zAxis, arm.angle / 3);
          mesh.position.x += ARM_SCALE * 0.48 * scale;
        } else {
          mesh.setRotationFromAxisAngle(zAxis, -arm.angle / 3);
          mesh.position.x -= ARM_SCALE * 0.48 * scale;
        }
        mesh.position.y += (-ARM_SCALE * 0.2 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
        mesh.position.z -= 2 * MIN_OFFSET_Z;
        break;
    }
  });
};

const updateLeg = (leg, side, position, direction, scale) => {
  updateMeshes(leg.meshes, direction, (mesh) => {
    mesh.scale.x = LEG_SCALE * scale;
    mesh.scale.y = LEG_SCALE * scale;
    mesh.position.copy(position);
    switch (direction) {
      case 'left':
      case 'right':
        mesh.position.y += (LEG_SCALE * 0.67 + OFFSET_Y) * scale;
        mesh.setRotationFromAxisAngle(zAxis, (direction === 'right' ? -1 : 1) * leg.angle);
        if (direction === side) {
          mesh.position.z += 2 * MIN_OFFSET_Z;
        } else {
          mesh.position.z -= 2 * MIN_OFFSET_Z;
        }
        break;
      case 'front':
        if (leg.angle < 0) {
          mesh.scale.y *= Math.cos(leg.angle) * Math.cos(leg.angle);
        }
        if (side === 'left') {
          mesh.position.x += ARM_SCALE * 0.38 * scale;
        } else {
          mesh.position.x -= ARM_SCALE * 0.38 * scale;
        }
        mesh.position.y += (LEG_SCALE + OFFSET_Y) * scale;
        mesh.position.z += MIN_OFFSET_Z;
        break;
      case 'back':
        if (leg.angle < 0) {
          mesh.scale.y *= Math.cos(leg.angle) * Math.cos(leg.angle);
        }
        if (side === 'right') {
          mesh.position.x += ARM_SCALE * 0.38 * scale;
        } else {
          mesh.position.x -= ARM_SCALE * 0.38 * scale;
        }
        mesh.position.y += (LEG_SCALE + OFFSET_Y) * scale;
        mesh.position.z -= MIN_OFFSET_Z;
        break;
    }
  });
};

export default (person) => {
  updateBody(person.body, person.position, person.direction, person.scale);
  updateHead(person.head, person.position, person.direction, person.scale);
  updateArm(person.leftArm, 'left', person.position, person.direction, person.scale);
  updateArm(person.rightArm, 'right', person.position, person.direction, person.scale);
  updateLeg(person.leftLeg, 'left', person.position, person.direction, person.scale);
  updateLeg(person.rightLeg, 'right', person.position, person.direction, person.scale);
};