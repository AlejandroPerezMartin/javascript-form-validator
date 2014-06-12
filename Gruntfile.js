module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /*------------------------------*\
                    CSSLint
        \*------------------------------*/
        csslint: {
            strict: {
                options: {
                    import: 2
                },
                src: 'css/build/styles.css'
            }
        },


        /*------------------------------*\
                    CSSMin
        \*------------------------------*/
        cssmin: {
            combine: {
                files: {
                    'form-validator.min.css': 'form-validator.css'
                }
            }
        },


        /*------------------------------*\
                    JSHint
        \*------------------------------*/
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            build: 'form-validator.js'
        },


        /*------------------------------*\
                    Uglify
        \*------------------------------*/
        uglify: {
            options: {
                beautify: false,
                compress: {
                    drop_console: true
                },
                preserveComments: false
            },
            build: {
                src: 'form-validator.js',
                dest: 'form-validator.min.js'
            }
        },


        /*------------------------------*\
                    Watch
        \*------------------------------*/
        watch: {
            css: {
                files: ['*.js', '*.css'],
                tasks: ['lint'],
            }
        },

    });

    // Load the plugins that provide the tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task (lint)
    grunt.registerTask('default', ['watch']);

    // Error inspection
    grunt.registerTask('lint', ['csslint', 'jshint']);

    // Build: files compilation and minification
    grunt.registerTask('build', ['uglify', 'cssmin']);

};
