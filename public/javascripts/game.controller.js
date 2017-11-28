// student.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('GameController', ['$scope','SocketService', GameController]);

    function GameController($scope, SocketService) { 
        var vm = this;
        //Variables

        
        // Functions
        vm.addMessage = addMessage;
    
        function addMessage() {
            SocketService.emit('clicked', 'holla');
        }
    }
})();