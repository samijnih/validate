function Exception(argument, message) {
    this.argument = argument;
    this.message  = message;

    this.toString = function () {
        return this.argument + ' ' + this.message + '.';
    };
}

function InvalidArgumentException(argument, message) {
    this.argument = argument;
    this.message  = message;

    this.toString = function () {
        return this.argument + ' ' + this.message + '.';
    };
}

var Validator = function (form, options) {
    /**
    * The form object
    * @type {Object}
    */
    this.form = form;

    /**
    * All default available options for this lib
    * @type {Object}
    */
    this.options = {
        mode: {
            return: 'return',
            prevent: 'prevent'
        }
    };

    /**
    * All elements of the form
    * @type {Object}
    */
    this.elements = {};

    /**
    * All rules for each elements
    * @type {Object}
    */
    this.closures = {};

    /**
    * All errors for each elements
    * @type {Object}
    */
    this.errors = {};

    /**
    * All messages for each rule
    * @type {Object}
    */
    this.messages = {};

    /**
    * TRUE: the form can be submitted|FALSE: the form can't be submitted
    * @type {Boolean}
    */
    this.canSubmit = false;

    this.params = {};

    this.rules = {
        accepted: function (self, obj) {
            if (obj.val().length) {
                var value = obj.val();

                return (value == 'yes') || (value == 'on') || (value == '1') || (value == 'true');
            } else {
                return true;
            }
        },
        array: function (self, obj) {
            if (obj.val().length) {
                return obj.val() instanceof Array;
            } else {
                return true;
            }
        },
        before: function (self, obj) {
            if (obj.val().length) {
                var date = obj.val().split(' - '),
                    lang = $("html").attr("lang");

                var a    = date[0].split('/'),
                    b    = date[1].split('/');

                if (lang === "fr") {
                    var before = a[2] + '/' + a[1] + '/' + a[0],
                        after  = b[2] + '/' + b[1] + '/' + b[0];
                } else {
                    var before = a[2] + '/' + a[0] + '/' + a[1],
                        after  = b[2] + '/' + b[0] + '/' + b[1];
                }

                return Date.parse(before) <= Date.parse(after);
            } else {
                return true;
            }
        },
        between: function (self, obj, min, max) {
            if (obj.val().length) {
                if (!$.isNumeric(min)) {
                    throw new InvalidArgumentException('between.min', 'must be numeric');
                } else if (!$.isNumeric(max)) {
                    throw new InvalidArgumentException('between.max', 'must be numeric');
                }

                var length = obj.val().length;

                if (length && length <= max && length >= min) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        date: function (self, obj) {
            if (obj.val().length) {
                var lang = ($('html').attr('lang') !== 'fr') && ($('html').attr('lang') !== 'en') ? 'fr' : $('html').attr('lang');

                if (lang === 'fr') {
                    var regex = new RegExp(/^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[\/-](0[1-9]|1[0-2])[\/-](20[\d]{2})$/);
                } else {
                    var regex = new RegExp(/^(0[1-9]|1[0-2])[\/-](0[1-9]|1[0-9]|2[0-9]|3[0-1])[\/-](20[\d]{2})$/);
                }

                return regex.test(obj.val());
            } else {
                return true;
            }
        },
        date_range: function (self, obj) {
            if (obj.val().length) {
                var lang  = ($('html').attr('lang') !== 'fr') && ($('html').attr('lang') !== 'en') ? 'fr' : $('html').attr('lang');

                if (lang === 'fr') {
                    var regex = new RegExp(/^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[\/-](0[1-9]|1[0-2])[\/-](20[\d]{2})\s-\s(0[1-9]|1[0-9]|2[0-9]|3[0-1])[\/-](0[1-9]|1[0-2])[\/-](20[\d]{2})$/);
                } else {
                    var regex = new RegExp(/^(0[1-9]|1[0-2])[\/-](0[1-9]|1[0-9]|2[0-9]|3[0-1])[\/-](20[\d]{2})\s-\s(0[1-9]|1[0-2])[\/-](0[1-9]|1[0-9]|2[0-9]|3[0-1])[\/-](20[\d]{2})$/);
                }

                return regex.test(obj.val());
            } else {
                return true;
            }
        },
        different: function (self, obj, field) {
            if (obj.val().length) {
                return obj.val() != field;
            } else {
                return true;
            }
        },
        digits_between: function (self, obj, min, max) {
            if (obj.val().length) {
                if (!$.isNumeric(min)) {
                    throw new InvalidArgumentException('digits_between.min', 'must be numeric');
                } else if (!$.isNumeric(max)) {
                    throw new InvalidArgumentException('digits_between.max', 'must be numeric');
                }

                var digit = obj.val();

                if ($.isNumeric(digit)
                && digit <= max
                && digit >= min) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        email: function (self, obj) {
            if (obj.val().length) {
                var regex = new RegExp(/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/);

                return regex.test(obj.val());
            } else {
                return true;
            }
        },
        file: function (self, obj) {
            if (obj.val().length) {
                return obj.prop('files').length ? true : false;
            } else {
                return true;
            }
        },
        image: function (self, obj) {
            if (obj.val().length) {
                if (self.rules.file(self, obj)) {
                    var image = obj.prop('files'),
                    regex = new RegExp(/(image)\/.+/);

                    return regex.test(image[0].type);
                } else {
                    throw new Exception(obj.attr('id'), 'is not a file');
                }
            } else {
                return true;
            }
        },
        integer: function (self, obj) {
            if (obj.val().length) {
                return typeof $("#phone").val() === 'number' ? true : false;
            } else {
                return true;
            }
        },
        max: function (self, obj, max) {
            if (obj.val().length) {
                if (self.rules.file(self, obj)) {
                    // Converts Kilobyte to Byte
                    max = max * 1024;
                    return obj.prop('files')[0].size <= max;
                } else {
                    return obj.val().length <= max;
                }
            } else {
                return true;
            }
        },
        mimes: function (self, obj, mimes) {
            if (obj.val().length) {
                if (self.rules.file(self, obj)) {
                    var type    = obj.prop('files')[0].type.match(/image\/(.+)/),
                    correct = true;

                    if (type.length > 1) {
                        type = type[1];
                    } else {
                        return false;
                    }

                    if (mimes.indexOf(type) === -1) {
                        correct = false;
                    }

                    return correct;
                } else {
                    throw new Exception(obj.attr('id'), 'is not a file');
                }
            } else {
                return true;
            }
        },
        min: function (self, obj, min) {
            if (obj.val().length) {
                if (self.rules.file(self, obj)) {
                    // Converts Kilobyte to Byte
                    min = min * 1024;
                    return obj.prop('files')[0].size >= min;
                } else {
                    return obj.val().length >= min;
                }
            } else {
                return true;
            }
        },
        negative: function (self, obj) {
            if (obj.val().length) {
                return obj.val() < 0;
            } else {
                return true;
            }
        },
        numeric: function (self, obj) {
            if (obj.val().length) {
                return $.isNumeric(obj.val());
            } else {
                return true;
            }
        },
        phone: function (self, obj) {
            if (obj.val().length) {
                var regex = new RegExp(/^0[\d]{9}$/);

                return regex.test(obj.val());
            } else {
                return true;
            }
        },
        positive: function (self, obj) {
            if (obj.val().length) {
                return obj.val() > 0;
            } else {
                return true;
            }
        },
        required: function (self, obj) {
            try {
                if (obj.is(':checkbox')) {
                    return typeof $('*[name="' + obj.attr('name') + '"]:checked').val() !== "undefined";
                } else if (obj.is(':radio')) {
                    return typeof $('*[name="' + obj.attr('name') + '"]:checked').val() !== "undefined";
                } else if (obj.is('select')) {
                    return obj.val().length;
                } else {
                    return obj.val().length;
                }
            } catch (err) {
                console.log(err.message);
                console.log(obj);
            }
        },
        regex: function (self, obj, pattern, flag) {
            if (obj.val().length) {
                if (typeof flag !== "undefined") {
                    var regex = new RegExp(pattern, flag);
                } else {
                    var regex = new RegExp(pattern);
                }

                return regex.test(obj.val());
            } else {
                return true;
            }
        },
        size: function (self, obj, size) {
            if (obj.val().length) {
                if (self.rules.file(self, obj)) {
                    // Converts Kilobyte to Byte
                    size = size * 1024;
                    return obj.prop('files')[0].size === size;
                } else {
                    return obj.val().length === size;
                }
            } else {
                return true;
            }
        },
        string: function (self, obj) {
            if (obj.val().length) {
                return typeof obj.val() === 'string';
            } else {
                return true;
            }
        },
        url: function (self, obj) {
            if (obj.val().length) {
                var regex = new RegExp(/^(https?:\/\/)([a-z]+(\.))?([\w]+){1}\.([\w]+){1}$/);

                return regex.test(obj.val());
            } else {
                return true;
            }
        },
        year: function (self, obj) {
            if (obj.val().length) {
                var date = obj.val().split(' - '),
                lang = ($('html').attr('lang') !== 'fr') && ($('html').attr('lang') !== 'en') ? 'fr' : $('html').attr('lang');

                // Get the year
                var year = date[0].split('-')[2];

                // Gets milliseconds of each date
                var currentYear = new Date().getFullYear();

                return year >= currentYear;
            } else {
                return true;
            }
        }
    };

    /**
    * Add a rule for an element
    *
    * @param {String}   name
    * @param {String}   rule
    * @param {String}   message
    * @param {Array}    params
    * @param {Object}   insertAfter
    * @param {Function} callback
    *
    * @return {Object} this
    */
    this.addRule = function (name, rule, message, callback, insertAfter, params) {
        var element       = $('#' + this.form.attr('id') + ' *[name="' + name + '"]'),
        formattedRule = name + '.' + rule;

        if (typeof this.elements[name] !== "undefined") {
            this.elements[name].rules[formattedRule]       = true;
            this.elements[name].insertAfter[formattedRule] = insertAfter;
        } else {
            this.elements[name] = {};

            this.elements[name].rules                = {};
            this.elements[name].rules[formattedRule] = true;

            this.elements[name].el = element;

            this.elements[name].insertAfter                = {};
            this.elements[name].insertAfter[formattedRule] = insertAfter;
        }

        this.params[formattedRule]   = params;
        this.messages[formattedRule] = message;

        // Callback
        if ((typeof callback !== "undefined")
        && (callback instanceof Function)) {
            this.closures[formattedRule] = callback;
        } else {
            // The callback wasn't defined
            // Check if the name exists in this.rules to take its callback
            if (rule in this.rules) {
                this.closures[formattedRule] = this.rules[rule];
            } else {
                throw new InvalidArgumentException('callback', 'must be of type function');
            }
        }

        return this;
    };

    this.addRules = function (rules) {
        // If rules is defined and is an object
        if (typeof rules !== "undefined" && (rules instanceof Object)) {
            // If rules has at least 1 name
            if (Object.keys(rules).length > 0) {
                // For each name
                for (name in rules) {
                    // If value of name is an Object and has at least 1 rule
                    if ((rules[name] instanceof Object)
                    && (Object.keys(rules[name]).length > 0)) {

                        // Set the insertAfter
                        if (typeof rules[name].insertAfter !== "undefined") {
                            var insertAfter = rules[name].insertAfter;
                        } else {
                            var insertAfter = undefined;
                        }

                        // If rules were defined
                        if ((typeof rules[name].rules !== "undefined")
                        && (rules[name].rules instanceof Object)) {
                            for (rule in rules[name].rules) {
                                // Arguments
                                if (typeof rules[name].rules[rule].params !== "undefined") {
                                    if (rules[name].rules[rule].params instanceof Array) {
                                        var params = rules[name].rules[rule].params;
                                    } else {
                                        throw new InvalidArgumentException('params', 'must be of type array');
                                    }
                                } else {
                                    var params = undefined;
                                }

                                // Message
                                if ((typeof rules[name].rules[rule].message !== "undefined")
                                && (typeof rules[name].rules[rule].message === "string")) {
                                    var message = rules[name].rules[rule].message;
                                } else {
                                    throw new InvalidArgumentException('message', '"' + name + '.' + rule + '" must be of type string');
                                }

                                // Callback
                                if ((typeof rules[name].rules[rule].callback !== "undefined")
                                && (rules[name].rules[rule].callback instanceof Function)) {
                                    var callback = rules[name].rules[rule].callback;
                                } else {
                                    // The callback wasn't defined
                                    // Check if the name exists in this.rules to take its callback
                                    if (rule in this.rules) {
                                        var callback = this.rules[rule];
                                    } else {
                                        throw new InvalidArgumentException('callback', 'must be of type function');
                                    }
                                }

                                // Add the rule
                                this.addRule(name, rule, message, callback, insertAfter, params);
                            }
                        } else {
                            throw new InvalidArgumentException('rules', 'must be of type object');
                        }
                    } else {
                        throw new InvalidArgumentException('name', 'must be of type object and contain at least 1 argument');
                    }
                }
            } else {
                throw new InvalidArgumentException('rules', 'must contain at least 1 argument');
            }
        } else {
            throw new InvalidArgumentException('rules', 'must be of type object');
        }
    }

    /**
    * For each element, check if the rule returns false or no
    */
    this.processRules = function () {
        var errors = 0;

        for (var element in this.elements) {
            var el          = this.elements[element].el,
            insertAfter = this.elements[element].insertAfter,
            rules       = this.elements[element].rules,
            subErrors   = 0;

            for (var rule in rules) {
                if (!subErrors) {
                    var params = [this, el];

                    if (typeof this.params[rule] !== "undefined") {
                        for (var i = 0, l = this.params[rule].length; i < l; i++) {
                            params.push(this.params[rule][i]);
                        }
                    }

                    if (!this.closures[rule].apply(null, params)) {
                        subErrors++;
                        errors++;

                        el.closest('.form-group').addClass('has-error');

                        if (typeof insertAfter[rule] === "undefined") {
                            el.closest('.form-group').after('<p class="error">' + this.messages[rule] + '</p>');
                        } else {
                            $('<p class="error">' + this.messages[rule] + '</p>').insertAfter(insertAfter[rule]);
                        }
                    }
                }
            }
        }

        this.canSubmit = errors ? false : true;
    };

    /**
    * Remove all displayed errors into each form
    */
    this.cleanErrors = function () {
        this.form.find('.has-error').removeClass('has-error');
        this.form.find('p.error').remove();
    };

    /**
    * Checks if the form can be submitted or no
    *
    * @param {Object} event
    * @return {Boolean|void}
    */
    this.check = function (event) {
        this.cleanErrors();
        this.processRules();

        // If canSubmit has false, the form can't be submitted
        if (!this.canSubmit) {
            // If the mode hasn't been set, preventDefault
            if (Object.keys(this.options.mode).length > 1) {
                event.preventDefault();
            } else {
                if (Object.keys(this.options.mode)[0] === 'return') {
                    return false;
                } else if (Object.keys(this.options.mode)[0] === 'prevent') {
                    event.preventDefault();
                }
            }
        } else if (Object.keys(this.options.mode)[0] === 'return') {
            return true;
        }
    };

    // If the user setted options
    if ((typeof options !== "undefined") && (options instanceof Object)) {
        // If the mode option were specified
        if ((typeof options.mode !== "undefined") && (typeof options.mode === "string")) {
            if (options.mode in this.options.mode) {
                for (var o in this.options.mode) {
                    if (o !== options.mode) {
                        // Delete the option
                        delete this.options.mode[o];
                    } else {
                        // Overwrite
                        this.options.mode[o] = true;
                    }
                }
            }
        }
    }

    return this;
};
