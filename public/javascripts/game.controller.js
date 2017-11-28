// student.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('GameController', ['$scope','SocketService', GameController]);

    function GameController($scope, SocketService) {
        var vm = this;
        //Variables
        vm.codeword = "";
        vm.words = ['Pants', 'Fan', 'Australia', 'Part', 'Dinosaur', 'Carrot',
                       'Mass', 'Vacuum','Row','Iron','Chair','Bomb','Embassy','Paper',
                       'Africa','Mint','Maple','Bat','Ship','Bear','Line',
                       'Note','Fire','Glass','Key'];

        vm.selectedIndex = [-1];
        // Functions
        vm.addMessage = addMessage;
        vm.checkSquare = checkSquare;
        vm.squareSelected = squareSelected;

        vm.agentNumbers = [];
        vm.assassinNumbers = [];
        vm.numArray = loadNumArray();
        vm.wordList = [];

        class Person {
            constructor(word, type){
                this.word = word;
                this.type = type;
                this.reveal = false;
            }
        }

        vm.getRandomAgentNumbers = getRandomAgentNumbers;
        vm.loadWordList = loadWordList;

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

        function loadNumArray() {
            var n = 0;
            var numArray = [];
            while(n <= 24) {
                numArray.push(n);
                n++;
            }
            console.log(numArray);
            return numArray;
        }

        function loadWordList() {
            vm.words.forEach(function(w) {
                var x = new Person(w, "bystander");
                vm.wordList.push(x);
            });

            console.log(vm.wordList);


           vm.agentNumbers.forEach(function(x) {
               vm.wordList[x].type = "agent";
           })

           vm.assassinNumbers.forEach(function(x) {
               vm.wordList[x].type = "assassin";
           })
        };

        function getRandomAgentNumbers() {
            var x;

            while(vm.numArray.length >= 13 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.agentNumbers.push(x[0]);
            }

            console.log(vm.agentNumbers);
            console.log(vm.numArray);

            getRandomAssassinNumbers();
        }

        function getRandomAssassinNumbers() {
            var x;
            while(vm.numArray.length >= 10 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.assassinNumbers.push(x[0]);
            }

            console.log(vm.assassinNumbers);

            loadWordList();
            console.log(vm.wordList);
        }

        getRandomAgentNumbers();

    }
})();
