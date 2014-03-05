define([
  './WBClass'
], function (WBClass) {

  'use strict';

  function proxy (name) {
    return function () {
      var deferred = this.deferred;
      return deferred[name].apply(deferred, arguments);
    };
  }

  var proto = {
    'constructor': function (deferred) {
      this.deferred = deferred;
    }
  };

  [
    'state',
    'done',
    'fail',
    'then'
  ].forEach(function (name) {
    proto[name] = proxy(name);
  });

  return WBClass.extend(proto);

});