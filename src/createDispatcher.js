export default () => {
  const listeners = {};

  return {
    listen: (listenerId, eventName, callback) => {
      listeners[listenerId] = {
        ...(listeners[listenerId] || {}),
        [eventName]: callback
      };
    },
    trigger: (eventName, event) => {
      Object.keys(listeners).forEach(listenerId => {
        const callback = listeners[listenerId][eventName];
        callback && callback(event);
      });
    }
  }
};