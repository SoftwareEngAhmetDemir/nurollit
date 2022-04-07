/*
 *
 * Application Main
 *
 */
!(function(APP) {
    'use strict';


    var breakpoint = 768;

    $.extend(true, APP, {
        breakpoint: breakpoint,
        init: {
            form: function() {
                var tel = $('.phone');

                if (tel) { tel.inputmask(); }
            }
        },

        INIT: function(options) {
            // APP init

            options = options || {};

            var fn;

            for (var i in this.init) {
                if ( Object.prototype.hasOwnProperty.call(this.init, i) && i.charAt(0) !== '_' && typeof(fn = this.init[i]) === 'function' ) {
                    fn.call(this, options && options[i] || options);
                }
            }

            return this;
        }
    });

})(window.APP = window.APP || {});

$(function() {
    'use strict';

    APP.browser = (function() {

        var is = APP.Helper.is,
            val, tmp,
            userAgent = APP.sanitizeXss(navigator.userAgent);

        var browser = {
            mobile: !!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(userAgent),
            ios: !!/iPhone|iPad|iPod/i.test(userAgent),
            ie: (tmp = userAgent.toLowerCase().match(/MSIE ([^;]+)|rv:(11)\.[0-9]+/i)) ? parseInt(tmp[1] || tmp[2], 10) : false,
            edge: (tmp = userAgent.indexOf('Edge/')) > 0 ? parseInt(userAgent.substring(tmp + 5, userAgent.indexOf('.', tmp)), 10) : false,
            bp: function() {
                return $(window).width() < APP.breakpoint;
            }
        };

        var $el = $('html'); // document.documentElement

        for (var k in browser ) {
            if ( Object.prototype.hasOwnProperty.call(browser, k) ) {
                val = browser[k];

                if ( val && !is.function(val) ) {
                    $el.addClass(k);
                    if ( !is.boolean(val) ) {
                        $el.addClass(k + val);
                    }
                }
            }
        }

        APP.browser = browser;

        return browser;
    }());

    APP.scriptPath = APP.Helper.getScriptPath(['app.js', 'app.min.js', 'main.js']);

    APP.Helper.loadScript(APP.scriptPath + 'config.js', {
        success: function() {
            APP.INIT(CONFIG);
        },
        failed: function() {
            APP.INIT();
        }
    });
});

/*
 *
 * Application Breakpoints Plugin
 * 2017-11-03
 *
 * Copyright 2017 Medyasoft
 * Licensed under the MIT license
 *
 */
!(function(root, factory) {
    'use strict';

    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['app', 'jquery'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS
        module.exports = factory(require('app'), require('jquery'));
    } else {
        // Browser globals
        root.APP = root.APP || {};
        factory(root.APP, root.jQuery);
    }
}(this, function(APP, $) {
    'use strict';

    var breakpoints = (function() {

        var MODULE = {};

        var DEFAULTS = {
            attachOnInit: true,
            bps: {
                md: 480,
                sm: 320,
                xs: 0
            }
        };

        var Helper = {
            isString: function(obj) {
                return $.type(obj) === 'string';
            },
            isElement: function(obj) {
                return !!$.type(obj).match(/^html([a-z]*)element$/);
            },
            isInteger: function(obj) {
                return Number(obj) === obj && obj % 1 === 0;
            },
            debounce: function(func, wait, immediate) {

                var timeout;

                return function() {

                    var args = [],
                        len = arguments.length;

                    while ( len-- ) {
                        args[ len ] = arguments[len];
                    }


                    var context = this;

                    clearTimeout(timeout);
                    timeout = setTimeout(function () {

                        timeout = null;

                        if ( !immediate ) {
                            func.apply(context, args);
                        }
                    }, wait);

                    if ( immediate && !timeout ) {
                        func.apply(context, args);
                    }
                };
            }
        };

        var options = {},
            currentSize = null,
            currentPoint = null;

        var getSize = function() {

            return $(window).width();
        };

        var getPoint = function(point) {

            var bps = options.bps;

            var s = getSize(),
                c = '',
                v, b;


            for (var k in bps) {

                if ( Object.prototype.hasOwnProperty.call(bps, k) ) {

                    v = bps[k];
                    b = bps[c] || 0;

                    if (v >= b && s >= v) {
                        c = k;
                    }
                }
            }

            return Helper.isString(point) && Helper.isNumeric(bps[point]) ? point === c : c;
        };

        var event = {
            resize: function(size, winDim) {

                $(MODULE).trigger({
                    type: 'resize.viewport',
                    payload: {
                        size: size,
                        winDim: winDim
                    }
                });
            },
            change: function(size, point) {

                size = size || currentSize;
                point = point || currentPoint;

                $(MODULE).trigger({
                    type: 'change.viewport',
                    payload: {
                        size: size,
                        point: point
                    }
                });
            }
        };

        var update = function(/* e */) {

            var newPoint = getPoint(),
                isChanged = currentPoint !== newPoint;

            currentPoint = newPoint;
            currentSize = getSize();

            isChanged && event.change(currentSize, currentPoint);
            event.resize(currentSize, {
                w: currentSize,
                h: $(window).height()
            });
        };

        var init = function(opts) {

            options = $.extend(true, DEFAULTS, opts);

            currentPoint = getPoint();
            currentSize = getSize();

            options.attachOnInit && $(window).on('resize', Helper.debounce(update, 50));
        };

        $.extend(MODULE, {
            DEFAULTS: DEFAULTS,
            init: init,
            getSize: getSize,
            getPoint: getPoint,
            update: update,
            getCurrentSize: function() {
                return currentSize;
            },
            getCurrentPoint: function() {
                return currentPoint;
            }
        });

        return MODULE;
    }());


    $.extend(true, APP, {
        breakpoints: breakpoints
    });

    return breakpoints;
}));

/*
 *
 * jQuery Carousel Plugins
 * 2021-24-03
 *
 * Licensed under the MIT license
 *
 */
!(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
    // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
    // Browser globals
        factory(root.jQuery);
    }
})(this, function ($) {
    'use strict';

    APP.carousel = {
        defaults: {
            base: {
                arrows: false,
                lazyLoad: 'ondemand',
                fade: false
            },
            main: {
                autoplay: true,
                autoplaySpeed: 7000,
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                responsive: [
                    {
                        breakpoint: APP.breakpoint,
                        settings: {
                            dots: true,
                            arrows: false,
                            autoplay: false
                        }
                    }
                ]
            },
            igrow: {
                autoplay: true,
                autoplaySpeed: 7000,
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
                responsive: [
                    {
                        breakpoint: APP.breakpoint,
                        settings: {
                            dots: false,
                            arrows: false,
                            autoplay: false
                        }
                    }
                ]
            },
            triple: {
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
                responsive: [
                    {
                        breakpoint: APP.breakpoint,
                        settings: {
                            dots: false,
                            arrows: false,
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            },
            preview: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                dots: false
            },
            navigation: {
                slidesPerRow: 3,
                slidesToScroll: 1,
                rows: 3,
                arrows: false,
                dots: true,
                infinite: false,
                counter: true
            },
            links: {
                slidesPerRow: 5,
                slidesToScroll: 1,
                rows: 3,
                arrows: true,
                infinite: false
            },
            doublec: {
                slidesToShow: 4,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
                infinite: false,
                responsive: [
                    {
                        breakpoint: 1191,
                        settings: {
                            dots: false,
                            arrows: false,
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    }
                ]
            }
        },
        getOptions: function ($slick, $carousel) {
            var root = APP.carousel,
                appOptions = root.options;

            var typeData = APP.sanitizeXss($slick.data('slickType')),
                types = typeData ? typeData.split(',') : [],
                options = $.extend(true, {}, root.defaults.base),
                type;

            types.length && $carousel.addClass('slider-' + types[0]);

            while (types.length) {
                type = types.shift();

                if (root.defaults[type]) {
                    $.extend(true, options, root.defaults[type]);
                }
            }

            if (appOptions && appOptions[type]) {
                $.extend(true, options, appOptions[type]);
            }

            $.extend(true, options, {
                prevArrow: $carousel.find('.slick-prev'),
                nextArrow: $carousel.find('.slick-next')
            });

            if (options.dots && $carousel.find('.dots').length > 0) {
                $.extend(options, {
                    appendDots: $carousel.find('.dots')
                });
            }

            return options;
        },
        types: {
            linked: function ($carousel) {
                var root = APP.carousel;

                var $slickFor = $carousel.find('[data-slick-role=for]').eq(0),
                    $slickNav = $carousel.find('[data-slick-role=nav]').eq(0);

                $slickNav.on('click', function (e) {
                    e.preventDefault();
                });

                var slickForOpts = root.getOptions($slickFor, $carousel),
                    slickNavOpts = root.getOptions($slickNav, $carousel);

                $.extend(slickForOpts, {
                    asNavFor: $slickNav,
                    prevArrow: $carousel.find('.slick-prev'),
                    nextArrow: $carousel.find('.slick-next')
                });

                $.extend(slickNavOpts, {
                    asNavFor: $slickFor
                });

                $slickFor.slick(slickForOpts);
                $slickNav.slick(slickNavOpts);
            },
            indexed: function ($carousel) {
                if (APP.browser.bp()) {
                    return;
                }

                var root = APP.carousel,
                    sliderCounter;

                var $slickFor = $carousel.find('[data-slick-role=for]').eq(0),
                    $slickNav = $carousel.find('[data-slick-role=nav]').eq(0);

                var slickForOpts = root.getOptions($slickFor, $carousel),
                    slickNavOpts = root.getOptions($slickNav, $carousel);

                var groupIndex,
                    slickNavObj,
                    slickForObj,
                    lastVals = {
                        nav: {
                            slideIndex: 0,
                            change: false
                        },
                        for: {
                            slideIndex: 0,
                            change: false
                        }
                    };

                $.extend(slickNavOpts, {
                    prevArrow: $slickNav.parent().find('.slick-prev'),
                    nextArrow: $slickNav.parent().find('.slick-next')
                });

                $.extend(slickForOpts, {
                    prevArrow: $slickFor.parent().find('.slick-prev'),
                    nextArrow: $slickFor.parent().find('.slick-next')
                });

                function getGroup() {
                    var slick = $slickFor.slick('getSlick'),
                        slides = slick.$slides,
                        group = [],
                        groupIndex = [],
                        groupIndexWithEl = [];

                    slides.each(function (i, el) {
                        var $el = $(el),
                            index = APP.sanitizeXss($el.data('groupIndex')) || APP.sanitizeXss(
                                $el.find('[data-group-index]').data('groupIndex').toString()
                            );

                        index = parseInt(index, 10);

                        if (group.indexOf(index) < 0) {
                            group.push(index);
                            groupIndex.push(i);
                        }

                        groupIndexWithEl.push([i, index]);
                    });

                    return [group, groupIndex, groupIndexWithEl];
                }

                function beforeChange(event, slick, currentSlide, nextSlide) {
                    // Alt

                    if (!lastVals.nav.change) {
                        var gotoIndex = groupIndex[2][nextSlide][1];

                        lastVals.for.change = true;

                        if (slickNavOpts.rows && slickNavOpts.rows > 1) {
                            var oneSlideCount = slickNavOpts.rows * slickNavOpts.slidesPerRow;
                            var slideIndex = parseInt(
                                groupIndex[2][nextSlide][1] / oneSlideCount,
                                10
                            );

                            gotoIndex = slideIndex;
                            slickNavObj.$slider
                                .find('[data-group-index]')
                                .removeClass('active')
                                .eq(groupIndex[2][nextSlide][1])
                                .addClass('active');
                        }

                        slickNavObj.slickGoTo(gotoIndex);
                        lastVals.nav.slideIndex = gotoIndex;

                        lastVals.nav.change = false;
                    } else {
                        lastVals.nav.change = false;
                    }
                }

                function beforeChangeNav(event, slick, currentSlide, nextSlide) {
                    // Üst

                    if (!lastVals.for.change) {
                        lastVals.nav.change = true;
                        slickForObj.slickGoTo(groupIndex[1][nextSlide]);
                    }

                    lastVals.for.change = false;
                }

                function updateSliderCounter(slick) {
                    $(sliderCounter).text(
                        slick.slickCurrentSlide() + 1 + ' / ' + slick.slideCount
                    );
                }

                if (
                    slickNavOpts.centerMode && $slickNav.children().length < slickNavOpts.slidesToShow
                ) {
                    slickNavOpts.centerMode = false;
                    slickNavOpts.init = function () {
                        slickNavObj.$slides.on('click', function () {
                            var index = APP.sanitizeXss($(this).data('slickIndex'));

                            lastVals.for.change = false;
                            beforeChangeNav(null, slickNavObj, -1, index);
                        });
                    };
                }

                if (slickNavOpts.counter) {
                    $carousel.append($('<div class="slick-counter">'));
                    sliderCounter = $carousel.find('.slick-counter');

                    $slickFor.on('init', function (event, slick) {
                        updateSliderCounter(slick);
                    });

                    $slickFor.on('afterChange', function (event, slick, currentSlide) {
                        updateSliderCounter(slick, currentSlide);
                    });
                }

                $slickNav.slick(slickNavOpts);
                $slickFor.slick(slickForOpts);

                $slickFor.on('beforeChange', beforeChange);

                if (!(slickNavOpts.rows && slickNavOpts.rows > 0)) {
                    $slickNav.on('beforeChange', beforeChangeNav);
                }

                slickNavObj = $slickNav.slick('getSlick');
                slickForObj = $slickFor.slick('getSlick');
                groupIndex = getGroup();

                slickNavObj.$slider.find('[data-group-index]').on('click', function () {
                    var index = APP.sanitizeXss($(this).data('groupIndex'));

                    slickForObj.slickGoTo(index);
                });

                if (slickNavOpts.rows && slickNavOpts.rows > 1) {
                    slickNavObj.$slider.find('[data-group-index]').eq(0).trigger('click');
                }
            }
        },
        init: function () {
            var root = APP.carousel;

            var $carousel = $(this),
                carouselType = APP.sanitizeXss($carousel.data('carouselType'));

            if ($.isFunction(root.types[carouselType])) {
                root.types[carouselType]($carousel);
                return;
            }

            var $slick = $carousel.find('[data-slick]').eq(0),
                options = root.getOptions($slick, $carousel);

            if (APP.sanitizeXss($slick.data('initbreakpoint'))) {
                if (APP.browser.bp()) {
                    // Mobile
                    $slick.slick(options);
                }
            } else {
                $slick.slick(options);
            }
        }
    };

    APP.init.carousel = function (opts) {
        var root = APP.carousel;

        root.options = $.extend({}, opts);

        $('.carousel')
            .on('click', '.slick-prev, .slick-next', function (e) {
                e.preventDefault();
            })
            .each(root.init);
    };
});

/*
 *
 * jQuery Form Plugins
 * 2015-11-09
 *
 * Copyright 2015 Bogac Bokeer
 * Licensed under the MIT license
 *
 */
!(function(root, factory) {
    'use strict';

    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(root.jQuery);
    }
}(this, function($) {
    'use strict';

    $.extend($.fn, {
        radiobox: function(opts) {

            var PLUGIN_NAME = 'radiobox';

            var options = $.extend({
                activeClass: 'active',
                disabledClass: 'disabled'
            }, opts);

            var updateTrigger = function($item) {

                if ( !$item ) {
                    return;
                }

                var $label = $item.closest('label');

                $label.toggleClass(options.disabledClass, $item.prop('disabled') || $item.is(':disabled'));
                $label.toggleClass(options.activeClass, $item.prop('checked') || $item.is(':checked'));
            };

            function onChange($item/* , e */) {

                if ( !$item.data(PLUGIN_NAME) ) {
                    return;
                }

                if ( $item.is('[name]') ) {

                    var $itemGroup = $('input[type=radio][name="' + $item.attr('name') + '"]');

                    $itemGroup.filter(function() {
                        return !!$(this).data(PLUGIN_NAME);
                    }).each(function() {
                        updateTrigger($(this));
                    });
                } else {
                    updateTrigger($item);
                }
            }

            var $container = this,
                selector = 'input[type=radio]';

            $container.on('change', selector, function(e) {

                return onChange($(this), e);

            }).on('update.radiobox', selector, function(/* e */) {

                updateTrigger($(this));

            }).find(selector).data(PLUGIN_NAME, true).trigger('update.radiobox');


            return this;
        },
        checkbox: function(opts) {

            var PLUGIN_NAME = 'checkbox';

            var options = $.extend({
                activeClass: 'active',
                disabledClass: 'disabled'
            }, opts);


            var updateTrigger = function($item) {

                if ( !$item ) {
                    return;
                }

                var $label = $item.closest('label');

                $label.toggleClass(options.disabledClass, $item.prop('disabled') || $item.is(':disabled'));
                $label.toggleClass(options.activeClass, $item.prop('checked') || $item.is(':checked'));
            };

            function onChange($item/* , e */) {

                if ( !$item.data(PLUGIN_NAME) ) {
                    return true;
                }

                updateTrigger($item);

                return true;
            }


            var $container = this,
                selector = 'input[type=checkbox]';

            $container.on('change', selector, function(e) {

                return onChange($(this), e);

            }).on('update.checkbox', selector, function(/* , e */) {

                updateTrigger($(this));
            }).find(selector).data(PLUGIN_NAME, true).trigger('update.checkbox');


            return this;
        }
    });

    APP.init.forms = function(/* opts */) {

        var $container = $('body');

        $container.radiobox();
        $container.checkbox();
    };
}));

/*
 * Get Paged Data Plugin
 *
 * HandleBars required!
 */
/* eslint-disable */
!(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['app', 'jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('app'), require('jquery'));
    } else {
        // Browser globals

        root.APP = root.APP || {};
        root.APP.init = root.APP.init || {};

        factory(root.APP, root.jQuery);
    }
}(this, function (APP, $) {
    'use strict';

    APP.init.getPagedData = function (opts) {
        var options = $.extend({}, opts);
    
        function showMore(target, template, settings) {
    
            var isExtend = false;
            var currentPageIndex = 2;
            var container = $(target);
            var showMoreBtn = $('[data-target="' + APP.sanitizeXss(target.data('showmore')) + '"]');
            var showMoreBtnInnerHtml = showMoreBtn.html();
    
            var tmpl = $(template).html();
            var compiled = Handlebars.compile(tmpl); // eslint-disable-line
    
            function setItem(data) {
                if (!data.result) {
                    container.append('<div class="col-12"><div class="alert alert-warning">' + data.errorMessage + '</div></div>');
                    showMoreBtn.addClass('d-none');
                    return;
                }
    
                currentPageIndex++;
    
                for (var i = 0; i < data.items.length; i++) {
                    var compiledHtml = compiled(data.items[i]);
    
                    compiledHtml = compiledHtml.replace('class="', 'class="fadeInDown ');
                    container.append(compiledHtml);
                }
    
                if (isExtend === false && currentPageIndex > 1) {
                    isExtend = true;
                    showMoreBtn.removeClass('d-none');
                }
    
                // no data fix
    
                if (!APP.Helper.is.undefined(data.nextData)) {
                    showMoreBtn[data.nextData !== true ? 'addClass' : 'removeClass' ]('d-none');
                }
            }
    
            function sendViaAjax() {
                var dt = { page: currentPageIndex },
                    form = $(settings.toForm || APP.sanitizeXss(showMoreBtn.data('form')));
    
                showMoreBtn.prop('disabled', true).html(options.btnLoadingText);
    
                var formData = APP.Helper.getFormData(form);
    
                if (formData.page) {
                    dt.page = formData.page;
                    currentPageIndex = formData.page;
                }
    
                return APP.Helper.sendRequest(form, settings, dt).done(function (data) {
                    setItem(data);
    
                    showMoreBtn.prop('disabled', false).html(showMoreBtnInnerHtml);
    
                    APP.init.popups(CONFIG.popups);
                }).catch(function() {
                    // TODO: LOG HERE
                });
            }
    
            showMoreBtn.click(function(e) {
                e.preventDefault();
                sendViaAjax();
            });
        }
    
        $('[data-showmore]').each(function () {
    
            var type = APP.sanitizeXss($(this).data('showmore')),
                opts = options[type] || {},
                template = APP.sanitizeXss($(this).data('template'));
    
            opts.url = !opts.url ? APP.sanitizeXss($(this).data('url')).split('|')[0] : opts.url;
            opts.method = !opts.method ? APP.sanitizeXss($(this).data('url')).split('|')[1] || 'GET' : opts.method;
    
            showMore($(this), template, opts);
        });
    }

}));

/*
 *
 * Application Helper.is Functions
 * 2017-01-20
 *
 * Copyright 2017 Medyasoft
 * Licensed under the MIT license
 *
 */
!(function(root, factory) {
    'use strict';

    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['app', 'jquery'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS
        module.exports = factory(require('app'), require('jquery'));
    } else {
        // Browser globals
        root.APP = root.APP || {};
        factory(root.APP, root.jQuery);
    }
}(this, function(APP, $) {
    'use strict';

    var is = {
        string: function(obj) {
            return Object.prototype.toString.call(obj) === '[object String]';
        },
        number: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Number]';
        },
        integer: function(obj) {
            return parseFloat(obj) === parseInt(obj, 10) && !isNaN(obj);
        },
        boolean: function(obj) {
            return typeof obj === 'boolean' && obj.constructor === Boolean;
        },
        float: function(value) {
            return value === +value && value !== (value | 0);
        },
        array: $.isArray,
        function: $.isFunction,
        plainObject: $.isPlainObject,
        object: function(obj) {
            return obj && obj.constructor && obj instanceof Object;
        },
        objectLike: function(value) {
            return typeof value === 'object' && value !== null;
        },
        arguments: function(obj) {
            return !!(obj && Object.prototype.hasOwnProperty.call(obj, 'callee'));
        },
        regexp: function(obj) {
            return Object.prototype.toString.call(obj) === '[object RegExp]';
        },
        element: function(obj) {

            var result;

            try {
                result = obj instanceof HTMLElement;
            } catch (e) {
                result = typeof obj === 'object' && obj.nodeType === 1 && typeof obj.style === 'object' && typeof obj.ownerDocument === 'object';
            }

            return result;
        },
        date: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Date]';
        },
        'undefined': function(obj) { // eslint-disable-line quote-props
            return typeof obj === 'undefined';
        },
        empty: function(obj) {

            if ( obj === null ) {
                return true;
            }

            if ( this.is.array(obj) || this.is.string(obj)) {
                return obj.length === 0;
            }

            for (var key in obj) {
                if ( Object.prototype.hasOwnProperty.call(obj, key) ) {
                    return false;
                }
            }

            return true;
        },
        exists: function(what, ns, typed) {

            if ( !what || typeof what !== 'string' ) {
                return null;
            }

            ns = ns || window;
            typed = typed || null;
            what = what.split('.');

            var isExists = false,
                subns;

            while ( what.length > 1 && typeof ns === 'object' ) {
                subns = what.shift();
                ns = ns[subns];
            }

            if ( typeof ns === 'object' ) {
                what = what.shift();
                what = ns[what];
                isExists = typed ? typeof what === typed : typeof what !== 'undefined';
            }

            this.exists.lastValue = isExists ? what : null;

            return isExists;
        }
    };

    APP.Helper = APP.Helper || {};

    $.extend(true, APP.Helper, {
        is: is
    });

    return is;
}));

/*
 *
 * Application Helper Functions
 * 2017-01-20
 *
 * Copyright 2017 Bogac Bokeer
 * Licensed under the MIT license
 *
 */
!(function(root, factory) {
    'use strict';

    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['app', 'jquery'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS
        module.exports = factory(require('app'), require('jquery'));
    } else {
        // Browser globals
        root.APP = root.APP || {};
        factory(root.APP, root.jQuery);
    }
}(this, function(APP, $) {
    'use strict';

    var antiForgeryToken = $('input[name="__RequestVerificationToken"]');

    var Helper = {
        getScriptPath: function(scriptName) {

            if ( typeof scriptName === 'string' ) {
                scriptName = [scriptName];
            }

            var scripts = document.getElementsByTagName('script'),
                script, src, pos;

            for (var idx = 0, l = scripts.length; idx < l; idx++) {

                script = scripts[idx];

                if ( src = script.getAttribute('src') ) { // eslint-disable-line no-cond-assign
                    pos = src.lastIndexOf('/');
                    var n = src.substring(pos + 1).split('?')[0];

                    if ( scriptName.indexOf(n) > -1 ) {
                        return src.replace(/\/js(.*)/, '/js') + '/';
                    }
                }
            }

            return '';
        },
        loadStylesheet: function(url, id) {

            if ( !url ) {
                return;
            }

            id = id || 'theme-styles';

            var s = document.createElement('link');

            s.id = id;
            s.rel = 'stylesheet';
            s.type = 'text/css';
            s.media = 'all';
            s.href = url;

            document.getElementsByTagName('head')[0].appendChild(s);
        },
        loadScript: function(url, cb) {

            var js = document.createElement('script');

            js.type = 'text/javascript';
            // js.async = true;

            js.addEventListener('load', cb.success);
            js.addEventListener('error', cb.failed);

            js.src = url;

            document.body.appendChild(js);

            return js;
        },
        throttle: function(fn, threshhold, scope) {

            threshhold || (threshhold = 250);

            var last,
                deferTimer;

            return function() {

                var context = scope || this;

                var now = +new Date(),
                    args = arguments;

                if ( last && now < last + threshhold ) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args);
                    }, threshhold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        },
        debounce: function(func, wait, immediate) {

            // Returns a function, that, as long as it continues to be invoked, will not
            // be triggered. The function will be called after it stops being called for
            // N milliseconds. If `immediate` is passed, trigger the function on the
            // leading edge, instead of the trailing.

            var timeout;

            return function() {

                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if ( !immediate ) {
                        func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;

                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) {
                    func.apply(context, args);
                }
            };
        },
        curry: function(fn) {

            var slice = Array.prototype.slice,
                storedArgs = slice.call(arguments, 1);

            return function() {

                var newArgs = slice.call(arguments),
                    args = storedArgs.concat(newArgs);

                return fn.apply(null, args);
            };
        },
        tmpl: function(tmpl, obj) {

            var result = tmpl,
                re;

            for (var k in obj ) {
                if ( Object.prototype.hasOwnProperty.call(obj, k) ) {
                    re = new RegExp('{{(' + k + ')}}', 'g');
                    result = result.replace(re, obj[k]);
                    re = null;
                }
            }

            return result;
        },
        formatDate: function(d, f) {

            var is = this.is;

            if ( !is.date(d) ) {
                throw new Error('The first parametre must be a date');
            }

            f = f || 'dd.mm.yyyy';

            if ( !is.string(f) ) {
                throw new Error('The format parametre must be a string');
            }

            var currDate = d.getDate(),
                currMonth = d.getMonth() + 1,
                currYear = d.getFullYear();

            var currDate2 = currDate.toString().length < 2 ? '0' + currDate : currDate,
                currMonth2 = currMonth.toString().length < 2 ? '0' + currMonth : currMonth;

            return f.replace('yyyy', currYear)
                .replace('dd', currDate2)
                // .replace("mmmm", Names.get("months")[currMonth])
                .replace('mm', currMonth2)
                .replace('d', currDate)
                .replace('m', currMonth);
        },
        getSlug: function (url) {

            url = url || APP.sanitizeXss(window.location.pathname);

            return url.split('/').reverse()[0];
        },
        getFormData: function (form, extraData) {
            var data = {};

            if (form) {
                if (form.attr('enctype') === 'multipart/form-data') {
                    var formData = new FormData(form[0]);

                    Object.keys(extraData || {}).forEach(function(key) {
                        formData.append(key, extraData[key]);
                    });
                    return formData;
                }
                data = form.serializeArray().reduce(function (acc, v) {
                    acc[v.name] = v.value;
                    return acc;
                }, {});
            }
            return $.extend(data, extraData);
        },
        sendRequest: function (form, service, extraData, reqOpts) {
            var data = $.extend({
                langId: UNIGATE.current.langId || '',
                language: UNIGATE.current.language || '',
                slug: APP.Helper.getSlug()
            }, extraData);

            if (antiForgeryToken.length) {
                data.__RequestVerificationToken = APP.sanitizeXss(antiForgeryToken.val()); // eslint-disable-line
            }

            var formData = APP.Helper.getFormData(form, data);

            return $.ajax($.extend({
                method: service.method,
                url: APP.sanitizeXss(service.url),
                dataType: 'JSON',
                cache: false,
                data: formData
            }, reqOpts));
        }
    };

    var typeofs = ['number', 'boolean', 'object'],
        sanitizeXssReg = new RegExp(/(\b)(on\S+)(\s*)=|javascript|(<\s*)(\/*)script/ig);

    $.extend(true, APP, {
        Helper: Helper,
        sanitizeXss: function(val) {

            if (val) {

                if (typeofs.indexOf(typeof val) === -1) {

                    val = val.replace(sanitizeXssReg, '');
                    return val;
                } else if (typeof val !== 'function') {

                    return val;
                }
                return '';
            }
            return val;
        }
    });

    return Helper;
}));

/*
 * Native validation Plugin
 *
 * Fancybox required!
 */
/* eslint-disable */
!(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['app', 'jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('app'), require('jquery'));
    } else {
        // Browser globals

        root.APP = root.APP || {};
        root.APP.init = root.APP.init || {};

        factory(root.APP, root.jQuery);
    }
}(this, function (APP, $) {
    'use strict';

    APP.init.nativeValidation = function (opts) {
        var forms = document.getElementsByClassName('needs-validation');
        var validateClassName = 'was-validated';

        function checkValidate(form, event) {
            var result = form.checkValidity();

            if (result === false) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.remove(validateClassName);
            }
            form.classList.add(validateClassName);
            return result;
        }

        Array.prototype.filter.call(forms, function (form) {

            var $form = $(form);
            var reCaptcha = $form.find('.g-recaptcha');
            var template = $form.data('template');
            var tmpl,
                compiled,
                contentTextPlaceholder;
            var steps = $form.find('fieldset.step'),
                stepIndex = 0,
                hasAjax = $form.hasClass('send-ajax');

            if (template) {
                tmpl = $(template).html();
                compiled = Handlebars.compile(tmpl); // eslint-disable-line
                contentTextPlaceholder = $($(template).data('to'));
            }

            function goToStep(val) {
                $form.removeClass(validateClassName);
                if (val !== -1) {
                    steps.eq(stepIndex + val).removeClass('d-none').removeAttr('disabled');
                    steps.eq(stepIndex).addClass('d-none');
                } else {
                    steps.eq(stepIndex + val).removeClass('d-none');
                    steps.eq(stepIndex).addClass('d-none').attr('disabled', 'disabled');
                }
                
                if (val === 0) {
                    steps.addClass('d-none').attr('disabled', 'disabled');
                } else {
                    stepIndex += val;
                }

                document.documentElement.scrollTop = steps.eq(stepIndex).offset().top;
            }

            form.addEventListener('submit', function (event) {
                var result = checkValidate(form, event),
                    hasNextStep = false;

                if ($form.hasClass('form-wizard')) {
                    var step = steps.filter(':not(.d-none)'),
                        index = step.index();

                    if (hasNextStep = index < (steps.length - 1)) { // eslint-disable-line
                        hasNextStep = true;
                        if (result) {
                            event.preventDefault();
                            event.stopPropagation();
                            goToStep(1);
                        }
                    }
                }

                if (reCaptcha.length > 0) {
                    try {
                        var reCaptchaResult = grecaptcha.getResponse(reCaptcha[0].grecaptcha) !== "";
                        if (result) {
                            result = reCaptchaResult;
                        } else {
                            event.preventDefault();
                            event.stopPropagation();
                        }
    
                        reCaptcha.toggleClass('is-invalid', !reCaptchaResult);
                    } catch (eroor) { }
                }

                if (result && !hasNextStep && hasAjax) {
                    event.preventDefault();
                    event.stopPropagation();

                    $form.find('[type=submit]:last').prop('disabled', true);
                    $form.find('.loading').addClass('show');
                    APP.Helper.sendRequest($form, {
                        url: APP.sanitizeXss(form.action),
                        method: form.method
                    },
                        {},
                        {
                            processData: false,
                            contentType: false
                        }).done(function (e) {
                            if (e.Result) {
                                $form.removeClass(validateClassName);
                                form.reset();
                                while (stepIndex > 0) {
                                    goToStep(-1);
                                }

                                if (template) {
                                    contentTextPlaceholder.append(compiled(e.Data));
                                    var modal = APP.sanitizeXss($form.data('target'));
                                    $(modal).removeClass('d-none');

                                    goToStep(0);
                                } else {
                                    var modal = APP.sanitizeXss($form.data('target'));
                                    var options = {
                                        src: modal,
                                        type: 'inline'
                                    };
                        
                                    $.fancybox.open(options);
                                }
                            } else {
                                $.fancybox.open('<div class="popup-content">' + APP.sanitizeXss(e.ErrorMessage) + '</div>');
                            }

                            $form.find('.loading').removeClass('show');
                            $form.find('[type=submit]:last').prop('disabled', false);
                        }).fail(function() {
                            $form.find('.loading').removeClass('show');
                            $form.find('[type=submit]:last').prop('disabled', false);
                        });
                }

            }, false);

            $form.find('[data-prev="true"]').on('click', function () {
                goToStep(-1);
            });
        });

        window.verifyRecaptchaCallback = function(data) {
            if (data) {
                $('.g-recaptcha').removeClass('is-invalid');
            }
        }
    }

}));
