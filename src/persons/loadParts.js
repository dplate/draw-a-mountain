import loadSvg from "../lib/loadSvg.js";

export default async () => ({
  bodies: [
    {
      meshes: {
        left: await loadSvg('persons/bodies/blue-brown-left')
      },
      armColor: 'blue',
      legColor: 'brown'
    }
  ],
  heads: [
    {
      meshes: {
        left: await loadSvg('persons/heads/brown-left')
      }
    }
  ],
  arms: [
    {
      meshes: {
        left: {
          front: await loadSvg('persons/arms/blue-left-front'),
          back: await loadSvg('persons/arms/blue-left-back')
        }
      },
      color: 'blue'
    }
  ],
  legs: [
    {
      meshes: {
        left: {
          front: await loadSvg('persons/legs/brown-left-front'),
          back: await loadSvg('persons/legs/brown-left-back')
        }
      },
      color: 'brown'
    }
  ]
});