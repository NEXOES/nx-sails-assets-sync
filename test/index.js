/// <reference path="../typings/index.d.ts" />
/// <reference path="../../stengg-typings/index.d.ts" />
var Sails = require('sails').Sails;
describe('Basic tests ::', function () {
    // Var to hold a running sails app instance
    var sails;
    // Before running any tests, attempt to lift Sails
    before(function (done) {
        // Hook will timeout in 15 seconds
        this.timeout(30000);
        // Attempt to lift sails
        Sails().lift({
            hooks: {
                // Load the hook
                "nx-sails-assets-sync": require('../'),
                // Skip grunt (unless your hook uses it)
                "grunt": false
            },
            config: {
                'nx-sails-assets-sync': {
                    sourceDir: 'test/test_node_modules',
                    targetDir: 'test/test_assets/dependencies',
                    tasksDir: 'test/test_tasks'
                }
            },
            log: {
                level: "error"
            }
        }, function (err, _sails) {
            if (err) {
                return done(err);
            }
            sails = _sails;
            return done();
        });
    });
    // After tests are complete, lower Sails
    after(function (done) {
        // Lower Sails (if it successfully lifted)
        if (sails) {
            return sails.lower(done);
        }
        // Otherwise just return
        return done();
    });
    // Test that Sails can lift with the hook in place
    it('sails does not crash', function () {
        return true;
    });
});
//# sourceMappingURL=index.js.map