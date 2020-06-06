import loadSvg from '../lib/loadSvg.js';
import setOpacity from '../lib/setOpacity.js';

export default async (scene, dispatcher) => {
  const mesh = await loadSvg('particles/smoke');
  const particles = [];
  const visibleParticles = [];

  dispatcher.listen('smoke', 'animate', ({elapsedTime}) => {
    visibleParticles.forEach(particle => {
      particle.userData.lifeTimeFactor += elapsedTime / particle.userData.maxLifeTime;
      if (particle.userData.lifeTimeFactor > 1) {
        particle.visible = false;
        visibleParticles.splice(visibleParticles.indexOf(particle), 1);
      }
      const scale = particle.userData.startScale +
        (Math.sin(Math.PI * (particle.userData.lifeTimeFactor - 0.5)) + 1) / 2 *
        (particle.userData.endScale - particle.userData.startScale);
      particle.scale.x = scale;
      particle.scale.y = scale;

      particle.translateX(-elapsedTime * particle.userData.lifeTimeFactor * 0.000005);

      const speed = 0.000003 + particle.userData.startSpeed * (Math.sin(particle.userData.lifeTimeFactor * Math.PI / -2) + 1);
      particle.translateY(elapsedTime * speed);

      const opacity = (Math.sin(Math.PI * (particle.userData.lifeTimeFactor + 0.5)) + 1) / 2;
      setOpacity(particle, opacity);
    });
  });

  return {
    add: (point, startScale, endScale, maxLifeTime, startSpeed = 0) => {
      let particle = particles.find(p => !p.visible);
      if (!particle) {
        particle = mesh.clone(true);
        particle.material = mesh.material.clone();
        particles.push(particle);
        scene.add(particle);
      }

      particle.visible = true;
      visibleParticles.push(particle);
      particle.position.x = point.x;
      particle.position.y = point.y;
      particle.position.z = point.z - 0.001;
      particle.scale.x = startScale;
      particle.scale.y = startScale;
      particle.userData = {
        lifeTimeFactor: 0,
        maxLifeTime,
        startScale,
        endScale,
        startSpeed
      };
      setOpacity(particle, 1);
    }
  }
};