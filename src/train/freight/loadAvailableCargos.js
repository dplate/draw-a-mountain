import loadSvg from '../../lib/loadSvg.js';
import {MIN_Z} from '../../lib/constants.js';

const SCALE_CARGO = 0.08;

const loadAvailableCargo = async (scene, name) => {
  const cargo = await loadSvg('train/cargo/' + name);
  cargo.visible = false;
  cargo.scale.x = SCALE_CARGO;
  cargo.scale.y = SCALE_CARGO;
  cargo.position.x = -1.0;
  cargo.position.y = 0.0227;
  cargo.position.z = 0.1 - MIN_Z;
  scene.add(cargo);
  return cargo;
};

export default async (scene) => {
  return {
    grass: await loadAvailableCargo(scene, 'grass'),
    snow: await loadAvailableCargo(scene, 'snow'),
    rock: await loadAvailableCargo(scene, 'rock'),
    fir: await loadAvailableCargo(scene, 'fir'),
    leaf: await loadAvailableCargo(scene, 'leaf'),
    parasol: await loadAvailableCargo(scene, 'parasol'),
    stone: await loadAvailableCargo(scene, 'stone'),
    wood: await loadAvailableCargo(scene, 'wood'),
    cable: await loadAvailableCargo(scene, 'cable'),
    dirt: await loadAvailableCargo(scene, 'dirt'),
    sign: await loadAvailableCargo(scene, 'sign')
  };
};