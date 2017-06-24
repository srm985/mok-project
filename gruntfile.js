module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks 
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-newer');

    grunt.initConfig({
        clean: {
            files: [
                'dist/**/*'
            ]
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'languages', src: ['**/*'], dest: 'dist/languages' }
                ]
            }
        },
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({ browsers: ['last 15 versions'] })
                ]
            },
            dist: {
                expand: true,
                cwd: 'src/css/',
                src: 'keyboard.css',
                dest: 'dist/'
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: 'keyboard.css',
                    dest: 'dist/'
                }]
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: true
            },
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'src/js/',
                    src: 'keyboard.js',
                    dest: 'dist/'
                }]
            }
        },
    });

    grunt.registerTask('default', ['clean', 'copy', 'postcss', 'cssmin', 'uglify']);
};
