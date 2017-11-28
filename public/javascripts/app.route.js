(function() {
    'use strict';

    angular
        .module('app')
        .config(config)

    function config($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl : "/views/game.view.html"
        });
    };
})();