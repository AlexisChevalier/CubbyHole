"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodemon: {
            dev: {
                options: {
                    file: 'app.js',
                    args: ['dev'],
                    nodeArgs: [],
                    watchedExtensions: ['js', 'json', 'html'],
                    env: {
                        SSLPORT: '8445',
                        PORT: '8082'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['nodemon']);
};