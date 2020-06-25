export default (summiteers, elapsedTime) => {
  const navigator = summiteers.find(summiteer => summiteer.person.navigator);
  const others = summiteers.filter(summiteer => !summiteer.person.navigator);
  if (navigator.action === null) {
    navigator.person.setDirection(Math.random() < 0.5 ? 'left' : 'right');
    navigator.waitTimeLeft = 2000 + Math.random() * 2000;
    navigator.action = 'beforePointing';
  }
  switch (navigator.action) {
    case 'beforePointing':
      navigator.waitTimeLeft -= elapsedTime;
      if (navigator.waitTimeLeft < 0) {
        navigator.waitTimeLeft = 2000 + Math.random() * 1000;
        if (others.length > 0) {
          navigator.person.animation = 'pointing';
          others.forEach(other => {
            other.person.setDirection(navigator.person.direction);
          });
        }
        navigator.action = 'pointing';
      }
      break;
    case 'pointing':
      navigator.waitTimeLeft -= elapsedTime;
      if (navigator.waitTimeLeft < 0) {
        navigator.waitTimeLeft = 4000 + Math.random() * 2000;
        navigator.person.animation = 'standing';
        navigator.action = 'afterPointing';
      }
      break;
    case 'afterPointing':
      navigator.waitTimeLeft -= elapsedTime;
      if (navigator.waitTimeLeft < 0) {
        navigator.waitTimeLeft = 1000 + Math.random() * 1000;
        navigator.person.setDirection(Math.random() < 0.5 ? 'front' : (navigator.person.direction === 'left' ? 'right' : 'left'));
        navigator.action = 'otherDirection';
      }
      break;
    case 'otherDirection':
      navigator.waitTimeLeft -= elapsedTime;
      if (navigator.waitTimeLeft < 0) {
        others.forEach(other => {
          other.person.setDirection(navigator.person.direction);
        });
        navigator.waitTimeLeft = 5000 + Math.random() * 3000;
        navigator.action = 'otherDirectionOthers';
      }
      break;
    case 'otherDirectionOthers':
      navigator.waitTimeLeft -= elapsedTime;
      if (navigator.waitTimeLeft < 0) {
        return true;
      }
      break;
  }
  return false;
};