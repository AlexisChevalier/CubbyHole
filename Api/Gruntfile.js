module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodemon: {
            dev: {
                options: {
                    file: 'app.js',
                    args: ['dev'],
                    watchedExtensions: ['js', 'json', 'html'],
                    env: {
                        SSLPORT: '8444',
                        PORT: '8081'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['nodemon']);
};