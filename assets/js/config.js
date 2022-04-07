/*
 *
 * Application Config
 *
 */
!(function(root, factory) {
    'use strict';

    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if ( typeof module !== 'undefined' && module.exports ) {
        // CommonJS
        module.exports = factory(root);
    } else {
        // Browser globals
        root.CONFIG = factory(root);
    }
}(this, function(/* root */) {
    'use strict';

    return {
    };
}));
