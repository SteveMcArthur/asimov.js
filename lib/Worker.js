var Asimov = require('./Asimov');
module.exports = Asimov.extend({

  'start': function (next) {

    var self = this;

    if (self.running) return;
    self.running = true;

    var started = new Date();

    process.on('message', self.onMessage);

    process.on('exit', self.shutdownWorker);
    process.on('SIGHUP', self.shutdownWorker);
    process.on('SIGTERM', self.shutdownWorker);
    process.on('SIGINT', self.shutdownWorker);

    var amount = self.getSequence('preinit').length + self.getSequence('init').length + self.getSequence('postinit').length;

    if (!amount) {

      self.publish('app:started');

      process.send && process.send({
        'event': 'app:started',
        'initializers': amount
      });

      return next && next();
    }

    self.runSequence('preinit').done(function () {
      self.runSequence('init').done(function () {
        self.runSequence('postinit').done(function () {

          self.publish('app:started');

          process.send && process.send({
            'event': 'app:started',
            'initializers': amount,
            'started': started.valueOf()
          });

          if (typeof next === 'function') next();
        }).fail(self.error);
      }).fail(self.error);
    }).fail(self.error);

    return self.publicInterface();
  },

  'onMessage': function (data) {

    var self = this;
    console.log('worker received', data);
  },

  // more or less only here to catch the "exit" event
  'terminateWorker': function () {
    process.exit();
  },

  'shutdownWorker': function () {

    var self = this;

    if (!self._shutdown) {

      self._shutdown = true;
      process.connected && process.disconnect();

      var killSelf = setTimeout(function () {
        process.exit();
      }, 3 * 1000);

      killSelf.unref();

      self.runSequence('shutdown');
    }
  }
});
