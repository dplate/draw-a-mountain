import removeMesh from '../lib/removeMesh.js';
import setupAudio from '../setupAudio.js';

const createBlackMesh = () => {
  const geometry = new THREE.PlaneBufferGeometry(1, 15);
  geometry.translate(0.5, 5, 0.2);
  const material = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 1});
  return new THREE.Mesh(geometry, material);
};

const canvasSize = new THREE.Vector2();

const isVerticalViewport = (renderer) => {
  renderer.getSize(canvasSize);
  return canvasSize.y > canvasSize.x;
};

const requestFullscreen = (page) => {
  if (page.requestFullscreen) {
    page.requestFullscreen();
  } else if (page.msRequestFullscreen) {
    page.msRequestFullscreen();
  } else if (page.mozRequestFullScreen) {
    page.mozRequestFullScreen();
  } else if (page.webkitRequestFullscreen) {
    page.webkitRequestFullscreen();
  }
}

export default async ({scene, renderer, dispatcher}) => {
  const black = createBlackMesh();
  scene.add(black);

  const page = document.documentElement;
  const turn = document.getElementById('turn');
  const title = document.getElementById('title');
  const dp = document.getElementById('dp');
  const credits = document.getElementById('credits');

  const status = {
    action: isVerticalViewport(renderer) ? 'WAIT_FOR_TURN' : 'BLACK_FADE_OUT',
    progress: 0
  }

  return {
    waitForStart: () => {
      return new Promise(resolve => {
        renderer.setClearColor(new THREE.Color(0x027fbe));
        title.style.opacity = 0.75;

        dispatcher.listen('start', 'tap', () => {
          removeMesh(scene, black);
          title.style.opacity = 0;
          turn.style.display = 'none';
          dp.style.display = 'none';
          credits.style.display = 'none';
          status.action = 'TITLE_FADE_OUT';
          status.progress = 0;
          dispatcher.stopListen('start', 'tap');
          requestFullscreen(page);
          resolve(setupAudio(dispatcher));
        });

        dispatcher.listen('start', 'animate', ({elapsedTime}) => {
          switch (status.action) {
            case 'WAIT_FOR_TURN':
              if (!isVerticalViewport(renderer)) {
                turn.style.display = 'none';
                status.action = 'BLACK_FADE_OUT';
                status.progress = 0;
              } else {
                turn.style.opacity = 1;
              }
              break;
            case 'BLACK_FADE_OUT':
              status.progress += elapsedTime / 8000;
              black.material.opacity = 0.5 * (1 + Math.sin(Math.PI * (0.5 + status.progress)));
              if (status.progress > 1) {
                status.action = 'WAIT_FOR_CREDITS';
                status.progress = 0;
              }
              break;
            case 'WAIT_FOR_CREDITS':
              status.progress += elapsedTime / 3000;
              if (status.progress > 1) {
                dp.style.opacity = 0.75;
                credits.style.opacity = 0.75;
                status.action = 'SCROLL_THROUGH_CREDITS'
                credits.scrollTop = 0;
                status.progress = 0;
              }
              break;
            case 'SCROLL_THROUGH_CREDITS':
              renderer.getSize(canvasSize);
              const fontSize = Math.min(0.05 * canvasSize.x, 0.10 * canvasSize.y);
              status.progress += elapsedTime * fontSize / 2500;
              if (status.progress > 1) {
                const scrollProgress = Math.floor(status.progress);
                credits.scrollTop += scrollProgress;
                if (credits.scrollTop >= credits.scrollHeight - credits.clientHeight) {
                  credits.scrollTop = 0;
                }
                status.progress -= scrollProgress;
              }
              break;
            case 'TITLE_FADE_OUT':
              status.progress += elapsedTime / 5000;
              if (status.progress > 1) {
                title.style.display = 'none';
                dispatcher.stopListen('start', 'animate');
              }
              break;
          }
        });
      })
    }
  };
};