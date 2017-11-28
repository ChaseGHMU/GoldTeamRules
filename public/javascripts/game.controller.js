// student.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('GameController', ['$scope','SocketService', GameController]);

    function GameController($scope, SocketService) {
        var vm = this;
        //Variables
        vm.wordList = ['Pants', 'Fan', 'Australia', 'Part', 'Dinosaur', 'Carrot',
                       'Mass', 'Vacuum','Row','Iron','Chair','Bomb','Embassy','Paper',
                       'Africa','Mint','Maple','Bat','Ship','Bear','Line',
                       'Note','Fire','Glass','Key'];

        vm.selectedIndex = [-1];
        // Functions
        vm.addMessage = addMessage;
        vm.checkSquare = checkSquare;
        vm.squareSelected = squareSelected;

        function addMessage() {
            SocketService.emit('clicked', 'holla');
        }

        function squareSelected(guess){
          console.log("guess funcction")
          if($.inArray(vm.selectedIndex,guess) > -1){
            console.log("found in array");
          }
          return $.inArray(vm.selectedIndex, guess) > -1;
        };

        function checkSquare(guess) {
            console.log(guess);
            SocketService.emit('guessed', guess)
        }

        SocketService.on('returnGuess', function(guess){
          console.log(vm.wordList[guess]+" Has been clicked");
          vm.selectedIndex.push(guess);
          console.log(vm.selectedIndex);
        });

    }
})();
