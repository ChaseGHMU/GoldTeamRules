(function() {
    'use strict';

    angular
        .module('app')
        .config(config)

    function config($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl : "/views/students.view.html"
        })
        .when('/students', {
            templateUrl : "/views/students.view.html"
        })
        .when('/books', {
            templateUrl : "/views/books.view.html"
        });
    };
})();