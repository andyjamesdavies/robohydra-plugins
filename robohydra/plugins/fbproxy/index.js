var heads = require('robohydra').heads,
    RoboHydraHead = heads.RoboHydraHead,
    RoboHydraHeadWatchdog = heads.RoboHydraHeadWatchdog,
    RoboHydraHeadProxy = heads.RoboHydraHeadProxy;

exports.getBodyParts = function(config) {
  var projectPath = config.rootpath || '.';

  return {
    heads: [
      new RoboHydraHead({
        name: "filterfbauthtoken",
        path: '/fb/graph/.*',
        handler: function (req, res, next) {
          var auth_token = req.url.match(/auth_token=(.*)$/)[1];
          req.url = req.url.replace(auth_token, auth_token + '#_=_');
          
          next(req, res);
        }
      }),

      new RoboHydraHeadWatchdog({
          // Note that res.body is always uncompressed, even if
          // the original response was compressed. If you really
          // want the original body, try "res.rawBody".
          watcher: function(req, res) { },
          reporter: function(req, res) {
              console.log("-----------------------------");
              console.log("Response for request to " + req.url + " contained: \n\r" + res.body.toString());
              console.log("-----------------------------");
          }
      }),

      new RoboHydraHeadProxy({
          name: 'proxy',
          mountPath: '/fb/graph',
          proxyTo: 'https://graph.facebook.com/',
          setHostHeader: true
        })
    ]
  };
};