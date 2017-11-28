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
        vm.endRound = endRound;
        vm.codeWord = ""
        vm.roundNumber = 1;
        vm.returnedWord = ""
        vm.agentNumbers = [];
        vm.assassinNumbers = [];
        vm.numArray = loadNumArray();
        vm.wordList = [];
        vm.answerSheet = [];
        vm.playerOne;
        vm.playerTwo;

        class Person {
            constructor(word, type){
                this.word = word;
                this.type = type;
                this.reveal = false;
            }
        }

        class User {
            constructor(id, grid) {
                this.userId = id;
                this.playerGrid = grid;
                this.playerAnswer = [];
            }
        }

        function prepareUser() {
            getRandomAgentNumbers();
            getRandomAssassinNumbers();
            loadWordList();
        }



        vm.getRandomAgentNumbers = getRandomAgentNumbers;
        vm.loadWordList = loadWordList;

        function addMessage() {
            SocketService.emit('codeWordSent', vm.codeWord);
            vm.codeWord = ""
        }

        function squareSelected(guess){
          console.log("guess funcction")
          if($.inArray(vm.selectedIndex,guess) > -1){
            console.log("found in array");
          }
          return $.inArray(vm.selectedIndex, guess) > -1;
        };

        function endRound(number){
          console.log(number);
          SocketService.emit('bumpRound',number)
        }

        function checkSquare(guess) {
          SocketService.emit('guessed', guess)
        }

        SocketService.on('bumpRound', function(number){
          vm.roundNumber = number;
        })

        SocketService.on('codeWordReturned', function(word){
            vm.returnedWord = word;
        });

        SocketService.on('startRound', function(users) {
            prepareUser();
            vm.playerOne = new User(users[0],vm.wordList);
            console.log(vm.playerOne);
            vm.wordList = [];

            prepareUser();
            vm.playerTwo = new User(users[1],vm.wordList);
            console.log(vm.playerTwo);
            vm.wordList = [];
            vm.playerOne.playerAnswer = vm.playerTwo.playerGrid;
            vm.playerTwo.playerAnswer = vm.playerOne.playerGrid;
        })

        SocketService.on('returnedAnswers', function(answers){
          vm.wordList = answers;
        });

        SocketService.on('returnGuess', function(guess){
          console.log(vm.wordList[guess].word+" Has been clicked");
          if(vm.wordList[guess].type == 'bystander'){
            SocketService.emit('bumpRound', ++vm.roundNumber);
          }
          if(vm.wordList[guess].type == 'assassin'){
            SocketService.emit('bumpRound', 1);
          }
          vm.wordList[guess].reveal = true;
          console.log(vm.wordList[guess].reveal);
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
                vm.answerSheet.push(x);
            });

            console.log(vm.wordList);


           vm.agentNumbers.forEach(function(x) {
               vm.wordList[x].type = "agent";
               vm.answerSheet[x].type = "agent"
           })

           vm.assassinNumbers.forEach(function(x) {
               vm.wordList[x].type = "assassin";
               vm.answerSheet[x].type = "assassin";
           })

           SocketService.emit('answerSheet', vm.answerSheet);
        };

        function getRandomAgentNumbers() {
            var x;

            while(vm.numArray.length >= 13 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.agentNumbers.push(x[0]);
            }

            console.log(vm.agentNumbers);
            console.log(vm.numArray);
            vm.numArray = loadNumArray();
        }

        function getRandomAssassinNumbers() {
            var x;
            while(vm.numArray.length >= 10 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.assassinNumbers.push(x[0]);
            }

            console.log(vm.assassinNumbers);
        }

        // getRandomAgentNumbers();

    }
})();
