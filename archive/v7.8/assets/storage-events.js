(function () {
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;

  function notify(key) {
    window.dispatchEvent(new CustomEvent('ozer:local-data-change', { detail: { key } }));
  }

  Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (this === window.localStorage) notify(String(key));
  };
  Storage.prototype.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (this === window.localStorage) notify(String(key));
  };
  Storage.prototype.clear = function () {
    originalClear.call(this);
    if (this === window.localStorage) notify('*');
  };
})();

