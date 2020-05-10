const BODY_SCALE = 0.005;
const HEAD_SCALE = 0.005;
const ARM_SCALE = 0.0035;
const LEG_SCALE = 0.004;

const MIN_OFFSET_Z = 0.0001;

const updateBody = (body, position, scale) => {
  const mesh = body.meshes.left;
  mesh.scale.x = BODY_SCALE * scale;
  mesh.scale.y = BODY_SCALE * scale;
  mesh.position.copy(position);
  mesh.position.y += (BODY_SCALE + LEG_SCALE) * scale;
};

const updateHead = (head, position, scale) => {
  const mesh = head.meshes.left;
  mesh.scale.x = HEAD_SCALE * scale;
  mesh.scale.y = HEAD_SCALE * scale;
  mesh.position.copy(position);
  mesh.position.x -= (HEAD_SCALE * 0.1) * scale;
  mesh.position.y += (HEAD_SCALE * 0.8 + BODY_SCALE + LEG_SCALE) * scale;
};

const updateArmMesh = (mesh, position, scale, offsetZ) => {
  mesh.scale.x = ARM_SCALE * scale;
  mesh.scale.y = ARM_SCALE * scale;
  mesh.position.copy(position);
  mesh.position.x -= (ARM_SCALE * 0.1) * scale;
  mesh.position.y += (ARM_SCALE * -0.1 + BODY_SCALE + LEG_SCALE) * scale;
  mesh.position.z += offsetZ;
}

const updateArm = (arm, position, scale) => {
  updateArmMesh(arm.meshes.left.front, position, scale, 2 * MIN_OFFSET_Z);
  updateArmMesh(arm.meshes.left.back, position, scale, -2 * MIN_OFFSET_Z);
};

const updateLegMesh = (mesh, position, scale, offsetZ) => {
  mesh.scale.x = LEG_SCALE * scale;
  mesh.scale.y = LEG_SCALE * scale;
  mesh.position.copy(position);
  mesh.position.x -= (LEG_SCALE * 0.1) * scale;
  mesh.position.y += (LEG_SCALE) * scale;
  mesh.position.z += offsetZ;
}

const updateLeg = (leg, position, scale) => {
  updateLegMesh(leg.meshes.left.front, position, scale, MIN_OFFSET_Z);
  updateLegMesh(leg.meshes.left.back, position, scale, -MIN_OFFSET_Z);
};

export default (person) => {
  updateBody(person.body, person.position, person.scale);
  updateHead(person.head, person.position, person.scale);
  updateArm(person.arm, person.position, person.scale);
  updateLeg(person.leg, person.position, person.scale);
};