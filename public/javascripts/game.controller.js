// student.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('GameController', ['$scope','SocketService', GameController]);

    function GameController($scope, SocketService) { 
        var vm = this;
        //Variables
        vm.wordList = ['Pants', 'Fan', 'Australia', 'Part', 'Dinosaur', 'Carrot', 'Mass', 'Vacuum','Row','Iron','Chair','Bomb','Embassy','Paper','Africa','Mint','Maple','Bat','Ship','Bear','Line','Note','Fire','Glass','Key'];
        
        // Functions
        vm.addMessage = addMessage;
    
        function addMessage() {
            SocketService.emit('clicked', 'holla');
        }


    }
})();