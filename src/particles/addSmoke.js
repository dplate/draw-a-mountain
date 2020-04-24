import loadSvg from "../lib/loadSvg.js";
import setOpacity from "../lib/setOpacity.js";

export default async (scene, dispatcher) => {
  const mesh = await loadSvg('particles/smoke');
  const particles = [];

  dispatcher.listen('smoke', 'animate', ({elapsedTime}) => {
    particles.forEach(particle => {
      if (particle.visible) {
        particle.userData.lifeTimeFactor += elapsedTime / particle.userData.maxLifeTime;
        if (particle.userData.lifeTimeFactor > 1) {
          particle.visible = false;
        }
        const scale = particle.userData.startScale +
          (Math.sin(Math.PI * (particle.userData.lifeTimeFactor - 0.5)) + 1) / 2 *
          (particle.userData.endScale - particle.userData.startScale);
        particle.scale.x = scale;
        particle.scale.y = scale;
        particle.translateX(-elapsedTime * particle.userData.lifeTimeFactor * 0.000005);
        particle.translateY(elapsedTime * 0.000003);

        const opacity = (Math.sin(Math.PI * (particle.userData.lifeTimeFactor + 0.5)) + 1) / 2;
        setOpacity([particle], opacity);
      }
    });
  });

  return {
    add: (point, startScale, endScale, maxLifeTime) => {
      let particle = particles.find(p => !p.visible);
      if (!particle) {
        particle = mesh.clone(true);
        particle.children.forEach(child => {
          child.material = child.material.clone();
        })
        particles.push(particle);
        scene.add(particle);
      }

      particle.visible = true;
      particle.position.x = point.x;
      particle.position.y = point.y;
      particle.position.z = point.z - 0.001;
      particle.scale.x = startScale;
      particle.scale.y = startScale;
      particle.userData = {
        lifeTimeFactor: 0,
        maxLifeTime,
        startScale,
        endScale
      };
      setOpacity([particle], 1);
    }
  }
};