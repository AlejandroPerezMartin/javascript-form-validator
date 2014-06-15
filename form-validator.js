/**
 *
 * Copyright (c) 2014 Alejandro Perez Martin (AlePerez92)
 *
 * @name          JavaScript Form Validator (JS-Form-Validator.js)
 * @description   JavaScript form Validator.
 * @version       1.0.0
 * @build         June 12, 2014
 * @url           http://github.com/alejandroperezmartin/javascript-form-validator
 *
 * @author        Alejandro Perez Martin
 * @authorUrl     https://www.linkedin.com/in/aleperez92
 *
 */

(function (window, undefined) {

    'use strict';

    /*
     * Error messages
     *
     * @type {Object}
     */
    var errorMessages = {
        alphanumeric: "The %s field only allow numbers and letters",
        defaultError: "This field is invalid",
        email: "You entered an invalid email",
        equal_to: "The %s field value must to be equal to %a",
        exact_length: "The %s field value must to be %a characters in length",
        greater_than: "The %s field value must to be greater than %a",
        integer: "The %s field only accepts integers",
        less_than: "The %s field value must be less than %a",
        match: "The %s field should match '%a'",
        max_length: "The %s field value can't exceed %a charcters",
        min_length: "The %s field value must be at least %a characters in length",
        name: "The %s field only allows alphabetic characters, spaces and dashes",
        required: "This field is required",
        spanish_dni: "The %s field only allows 8 numbers and 1 character",
        spanish_mobile: "The %s field only allows 9 numbers",
        spanish_phone: "The %s field only allows 9 numbers",
        spanish_postal: "The %s field only allows 5 numbers",
        url: "This is not a valid URL",
        username: "The %s field only allows numbers, letters, '-' and '_'"
    },


        /*
         * Regular Expressions
         *
         * @type {RegExp}
         */
        alphanumericRegex = /^[a-zA-Z0-9]+$/,
        charsRegex = /^[A-z- 'áéíóúñçÁÉÍÓÚÑÇ]+$/,
        emailRegex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
        integerRegex = /^\-?[0-9]+$/,
        spanishDniRegex = /^[0-9]{8}[a-zA-Z]{1}$/,
        spanishMobileRegex = /^[67]{1}[0-9]{8}$/,
        spanishPhoneRegex = /^[6789]{1}[0-9]{8}$/,
        spanishPostalRegex = /^[0-5]{1}[0-9]{4}$/,
        urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        usernameRegex = /^[a-zA-Z0-9_-]+$/,


        /*
         * Checks if a DOM element has a class
         *
         * @param {Object} element DOM element
         * @param {String} className
         * @return {Boolean} Returns true if element has class className, otherwise false
         */
        hasClass = function (element, className) {
            return new RegExp(' ' + className + ' ').test(' ' + element.className + ' ');
        },


        /*
         * Adds class to DOM element
         *
         * @param {Object} element DOM element
         * @param {String} className
         */
        addClass = function (element, className) {
            if (!hasClass(element, className)) {
                element.className += ' ' + className;
            }
        },


        /*
         * Removes a class from a DOM element
         *
         * @source: http://toddmotto.com/creating-jquery-style-functions-in-javascript-hasclass-addclass-removeclass-toggleclass/
         * @param {Object} element DOM element
         * @param {String} className
         */
        removeClass = function (element, className) {
            var newClass = ' ' + element.className.replace(/[\t\r\n]/g, ' ') + ' ';

            if (hasClass(element, className)) {

                while (newClass.indexOf(' ' + className + ' ') >= 0) {
                    newClass = newClass.replace(' ' + className + ' ', ' ');
                }

                element.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        },


        /*
         * Removes the next sibling of a DOM element
         *
         * @param {Object} element DOM element
         * @param {String} siblingClass Sibling class name
         */
        removeNextSibling = function (element, siblingClass) {
            var nextSibling = element.nextSibling;
            if (nextSibling && hasClass(nextSibling, siblingClass)) {
                nextSibling.remove();
            }
        },


        /*
         * Appends a HTML block to a DOM element
         *
         * @param {Object} element DOM element
         * @param {String} newElement HTML string: '<p>Paragraph</p>'
         */
        append = function (element, htmlBlock) {
            element.insertAdjacentHTML('afterend', htmlBlock);
        },


        /*
         * FormValidator constructor
         *
         * @constructor
         * @param {String} formName Value of attribute 'name' of the form
         * @param {Array} fields Array of objects with the following structure [{name: "fieldName", rules: ["rule", ...]}, { ... }]
         */
        FormValidator = function (formName, fields, liveValidation) {
            this.fields = fields;
            this.form = this.getFormByName(formName);

            var self = this;

            if (liveValidation === 'live_validation') {
                
                for (var i = 0, len = this.fields.length; i < len; i += 1) {
                    
                    (function (i) {
                        var currentField = self.fields[i];
                        
                        // Validate field after losing focus
                        self.form[currentField.name].addEventListener('blur', function () {
                            self.validateField(currentField);

                            // Validate field on keyboard key release
                            this.addEventListener('keyup', function () {
                                self.validateField(currentField);
                            });
                        });

                    })(i);
                }
            }

            // Validate form on submit
            this.form.onsubmit = function (evt) {

                if (!self.validateForm(self.fields)) {

                    evt.preventDefault();

                    if (!document.getElementsByClassName('js-form-error-message')[0]) {

                        var error_message_div = document.createElement('DIV');
                        error_message_div.className = 'js-form-error-message';
                        error_message_div.innerHTML = '<span class="js-form-error-message-title">Ooooops!</span>This form seems to have errors.';

                        self.form.insertBefore(error_message_div, self.form.firstChild);
                    }
                }
            };

        };


    /*
     * Returns a DOM's form
     *
     * @param {String} formName
     * @return {Object} Returns the form object if exists, otherwise returns empty object
     */
    FormValidator.prototype.getFormByName = function (formName) {
        return (document.forms[formName] || {});
    };


    /*
     * Validates all the fields of the form
     *
     * @param {Array} fields Array of field names
     * @return {Boolean} Returns true if all the fields are valid, otherwise false
     */
    FormValidator.prototype.validateForm = function (fields) {
        if (fields.length <= 0) {
            return false;
        }

        var formIsValid = true;

        for (var i = 0, len = fields.length; i < len; i++) {
            if (!this.validateField(fields[i])) {
                formIsValid = false;
            }
        }

        return formIsValid;
    };


    /*
     * Validate the field whose 'name' attribute is equal to parameter: <input name="@param">
     *
     * @param {Object} field Field object containing name and rules
     * @return {Boolean} Returns true if the field is valid, otherwise false
     */
    FormValidator.prototype.validateField = function (field) {

        if (!field) {
            return false;
        }

        var formField = this.form[field.name];

        // Validate each rule for the current field
        for (var i = 0, len = field.rules.length; i < len; i++) {

            var rule = field.rules[i].split('=')[0], // get rule name
                arg = field.rules[i].split('=')[1]; // get rule parameter

            // Rule with parameters
            if (arg) {
                if (!this.validators.rule(formField, arg)) {

                    removeClass(formField, 'js-form-field-valid');
                    addClass(formField, 'js-form-field-invalid');
                    removeNextSibling(formField, 'js-form-field-error');
                    append(formField, '<span class="js-form-field-error">' + ((errorMessages.rule) ? errorMessages.rule.replace('%s', field.name).replace('%a', arg) : errorMessages.defaultError) + '</span>');

                    return false; // stop checking rules if one of them doesn't pass the test
                }
            }
            // Rule without parameters
            else {
                if (!this.validators.rule(formField)) {

                    removeClass(formField, 'js-form-field-valid');
                    addClass(formField, 'js-form-field-invalid');
                    removeNextSibling(formField, 'js-form-field-error');
                    append(formField, '<span class="js-form-field-error">' + ((errorMessages.rule) ? errorMessages.rule.replace('%s', field.name) : errorMessages.defaultError) + '</span>');

                    return false; // stop checking rules if one of them doesn't pass the test
                }
            }
        }

        // Field is valid
        removeNextSibling(formField, 'js-form-field-error');
        removeClass(formField, 'js-form-field-invalid');
        addClass(formField, 'js-form-field-valid');

        return true;
    };


    /*
     * Returns boolean indicating if field matches a regular expression
     *
     * @param {Object} field
     * @return {Boolean} Returns true if regular expression test is passed, otherwise false
     */
    FormValidator.prototype.validators = {
        alphanumeric: function (field) {
            return alphanumericRegex.test(field.value);
        },
        email: function (field) {
            return emailRegex.test(field.value);
        },
        equal_to: function (field, value) {
            return (integerRegex.test(value) && field.value === parseInt(value));
        },
        exact_length: function (field, length) {
            return (integerRegex.test(length) && field.value.length === parseInt(length));
        },
        greater_than: function (field, value) {
            return (integerRegex.test(field.value) && integerRegex.test(value) && field.value >= parseInt(value));
        },
        integer: function (field) {
            return integerRegex.test(field.value);
        },
        less_than: function (field, value) {
            return (integerRegex.test(field.value) && integerRegex.test(value) && field.value <= parseInt(value));
        },
        match: function (field, value) {
            console.log(value);
            return (alphanumericRegex.test(field.value) && alphanumericRegex.test(value) && field.value === value);
        },
        max_length: function (field, length) {
            return (integerRegex.test(length) && field.value.length <= parseInt(length));
        },
        min_length: function (field, length) {
            return (integerRegex.test(length) && field.value.length >= parseInt(length));
        },
        name: function (field) {
            return charsRegex.test(field.value);
        },
        required: function (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                return field.checked;
            }
            return (field.value !== null && field.value !== '');
        },
        spanish_dni: function (field) {
            if (spanishDniRegex.test(field.value)) {
                var letters = 'TRWAGMYFPDXBNJZSQVHLCKET';
                return field.value.slice(-1).toUpperCase() === letters[field.value.slice(0, 8) % 23];
            }
            return false;
        },
        spanish_phone: function (field) {
            return (spanishPhoneRegex.test(field.value));
        },
        spanish_mobile: function (field) {
            return (spanishMobileRegex.test(field.value));
        },
        spanish_postal: function (field) {
            return (spanishPostalRegex.test(field.value));
        },
        url: function (field) {
            return urlRegex.test(field.value);
        },
        username: function (field) {
            return usernameRegex.test(field.value);
        }
    };

    window.FormValidator = FormValidator;

})(window);
