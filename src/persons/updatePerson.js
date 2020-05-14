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
    mesh.position.x -= (direction === 'left' ? 1 : -1) * HEAD_SCALE * 0.1 * scale;
    mesh.position.y += (HEAD_SCALE * 0.8 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
  });
};

const updateArmMesh = (mesh, position, scale, offsetZ, angle) => {
  mesh.setRotationFromAxisAngle(zAxis, angle);
  mesh.scale.x = ARM_SCALE * scale;
  mesh.scale.y = ARM_SCALE * scale;
  mesh.position.copy(position);
  mesh.position.y += (-ARM_SCALE * 0.3 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
  mesh.position.z += offsetZ;
}

const updateArm = (arm, frontDirection, position, direction, scale) => {
  updateMeshes(arm.meshes, direction, (mesh) => {
    updateArmMesh(mesh, position, scale, direction === frontDirection ? 2 * MIN_OFFSET_Z : -2 * MIN_OFFSET_Z, arm.angle);
  });
};

const updateLegMesh = (mesh, position, scale, offsetZ, angle) => {
  mesh.setRotationFromAxisAngle(zAxis, angle);
  mesh.scale.x = LEG_SCALE * scale;
  mesh.scale.y = LEG_SCALE * scale;
  mesh.position.copy(position);
  mesh.position.y += (LEG_SCALE * 0.67 + OFFSET_Y) * scale;
  mesh.position.z += offsetZ;
}

const updateLeg = (leg, frontDirection, position, direction, scale) => {
  updateMeshes(leg.meshes, direction, (mesh) => {
    updateLegMesh(mesh, position, scale, direction === frontDirection ? MIN_OFFSET_Z : -MIN_OFFSET_Z, leg.angle);
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