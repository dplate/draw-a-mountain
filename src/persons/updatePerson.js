import {ARM_SCALE, BODY_SCALE, HEAD_SCALE, LEG_SCALE} from './personScales.js';
import {MIN_Z} from '../lib/constants.js';

const OFFSET_Y = 0.001;
const zAxis = new THREE.Vector3(0, 0, 1);

const updateBody = (body, position, direction, scale) => {
  const mesh = body.meshes[direction];
  mesh.position.copy(position);
  mesh.position.y += (BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
};

const updateHead = (head, position, direction, scale) => {
  const mesh = head.meshes[direction];
  mesh.position.copy(position);
  switch (direction) {
    case 'left':
      mesh.position.x -= 0.1 * mesh.userData.scale;
      break;
    case 'right':
      mesh.position.x += 0.1 * mesh.userData.scale;
      break;
  }
  mesh.position.y += (HEAD_SCALE * 0.8 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
};

const updateArm = (arm, side, position, direction, scale) => {
  const mesh = arm.meshes[direction];
  mesh.position.copy(position);
  switch (direction) {
    case 'left':
    case 'right':
      mesh.scale.y = mesh.userData.scale;
      mesh.setRotationFromAxisAngle(zAxis, (direction === 'right' ? -1 : 1) * arm.angle);
      mesh.position.y += (-ARM_SCALE * 0.3 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
      if (direction === side) {
        mesh.position.z += 2 * MIN_Z;
      } else {
        mesh.position.z -= 2 * MIN_Z;
      }
      break;
    case 'front':
      mesh.scale.y = mesh.userData.scale * Math.cos(arm.angle) * Math.cos(arm.angle);
      if (side === 'left') {
        mesh.setRotationFromAxisAngle(zAxis, arm.angle / 3);
        mesh.position.x += 0.48 * mesh.userData.scale;
      } else {
        mesh.setRotationFromAxisAngle(zAxis, -arm.angle / 3);
        mesh.position.x -= 0.48 * mesh.userData.scale;
      }
      mesh.position.y += (-ARM_SCALE * 0.2 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
      mesh.position.z += 2 * MIN_Z;
      break;
    case 'back':
      mesh.scale.y = mesh.userData.scale * Math.cos(arm.angle) * Math.cos(arm.angle);
      if (side === 'right') {
        mesh.setRotationFromAxisAngle(zAxis, arm.angle / 3);
        mesh.position.x += 0.48 * mesh.userData.scale;
      } else {
        mesh.setRotationFromAxisAngle(zAxis, -arm.angle / 3);
        mesh.position.x -= 0.48 * mesh.userData.scale;
      }
      mesh.position.y += (-ARM_SCALE * 0.2 + BODY_SCALE + LEG_SCALE + OFFSET_Y) * scale;
      mesh.position.z -= 2 * MIN_Z;
      break;
  }
};

const updateLeg = (leg, side, position, direction, scale) => {
  const mesh = leg.meshes[direction];
  mesh.position.copy(position);
  switch (direction) {
    case 'left':
    case 'right':
      mesh.scale.y = mesh.userData.scale;
      mesh.position.y += (LEG_SCALE * 0.67 + OFFSET_Y) * scale;
      mesh.setRotationFromAxisAngle(zAxis, (direction === 'right' ? -1 : 1) * leg.angle);
      if (direction === side) {
        mesh.position.z += MIN_Z;
      } else {
        mesh.position.z -= MIN_Z;
      }
      break;
    case 'front':
      if (leg.angle < 0) {
        mesh.scale.y = mesh.userData.scale * Math.cos(leg.angle) * Math.cos(leg.angle);
      } else {
        mesh.scale.y = mesh.userData.scale;
      }
      if (side === 'left') {
        mesh.position.x += 0.38 * mesh.userData.scale;
      } else {
        mesh.position.x -= 0.38 * mesh.userData.scale;
      }
      mesh.position.y += (LEG_SCALE + OFFSET_Y) * scale;
      mesh.position.z += MIN_Z;
      break;
    case 'back':
      LEG_SCALE * scale
      if (leg.angle < 0) {
        mesh.scale.y = mesh.userData.scale * Math.cos(leg.angle) * Math.cos(leg.angle);
      } else {
        mesh.scale.y = mesh.userData.scale;
      }
      if (side === 'right') {
        mesh.position.x += 0.38 * mesh.userData.scale;
      } else {
        mesh.position.x -= 0.38 * mesh.userData.scale;
      }
      mesh.position.y += (LEG_SCALE + OFFSET_Y) * scale;
      mesh.position.z -= MIN_Z;
      break;
  }
};

export default (person) => {
  updateBody(person.body, person.position, person.direction, person.scale);
  updateHead(person.head, person.position, person.direction, person.scale);
  updateArm(person.leftArm, 'left', person.position, person.direction, person.scale);
  updateArm(person.rightArm, 'right', person.position, person.direction, person.scale);
  updateLeg(person.leftLeg, 'left', person.position, person.direction, person.scale);
  updateLeg(person.rightLeg, 'right', person.position, person.direction, person.scale);
};