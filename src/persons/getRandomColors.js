import getRandomFromList from '../lib/getRandomFromList.js';

const getRandomColor = () => new THREE.Color(Math.random(), Math.random(), Math.random());

const shoeColors = [
  new THREE.Color(0xa05a2c),
  new THREE.Color(0x333333),
  new THREE.Color(0xcccccc)
];

const skinColors = [
  new THREE.Color(0xfbecd8),
  new THREE.Color(0xe5ccac),
  new THREE.Color(0xcca776),
  new THREE.Color(0xe5c395),
  new THREE.Color(0xdaa256)
];

const hairColors = [
  new THREE.Color(0x552200),
  new THREE.Color(0xf4d34d),
  new THREE.Color(0xe4e3e0),
  new THREE.Color(0x846418),
  new THREE.Color(0x4a3708),
  new THREE.Color(0xb3871c),
  new THREE.Color(0xe0d239),
  new THREE.Color(0xecb131)
];

const rucksackColors = [
  new THREE.Color(0xc87137),
  new THREE.Color(0x214443),
  new THREE.Color(0x443721),
  new THREE.Color(0x2d375c),
  new THREE.Color(0x4a2424),
  new THREE.Color(0x854408),
  new THREE.Color(0x9d5a23),
  new THREE.Color(0x68462c)
];

export default () => ({
  shirt: getRandomColor(),
  trouser: getRandomColor(),
  shoe: getRandomFromList(shoeColors),
  skin: getRandomFromList(skinColors),
  hair: getRandomFromList(hairColors),
  hat: getRandomColor(),
  rucksack: getRandomFromList(rucksackColors),
  bottle: getRandomColor()
});