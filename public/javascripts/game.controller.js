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
                       'Africa','Mint','Bird','Bat','Ship','Bear','Line',
                       'Note','Fire','Glass','Key'];
        vm.selectedIndex = [-1];
        vm.showGame;
        vm.showWait;

        // Functions
        vm.checkSquare = checkSquare;
        vm.squareSelected = squareSelected;
        vm.endRound = endRound;
        vm.addMessage = addMessage;
        vm.codeWord;
        vm.roundNumber = 1;
        vm.returnedWord;
        vm.agentNumbers = [];
        vm.assassinNumbers = [];
        vm.numArray = loadNumArray();
        vm.wordList = [];
        vm.answerSheet = [];
        vm.playerOne;
        vm.playerTwo;
        vm.active;

        class Card {
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
                this.active = false;
            }
        }

        function prepareUser() {
            getRandomAgentNumbers();
            getRandomAssassinNumbers();
            loadWordList();
        }

        function clearUser() {
            vm.numArray = [];
            vm.numArray = loadNumArray();
            vm.agentNumbers = [];
            vm.assassinNumbers = [];
            vm.wordList = [];
            vm.answerSheet = [];
        }

        vm.getRandomAgentNumbers = getRandomAgentNumbers;
        vm.loadWordList = loadWordList;

        function addMessage() {
          console.log(vm.codeWord);
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
          // console.log(number);
          if(vm.active){
            vm.active = false;
          }else{
            vm.active = true;
          }
          console.log(vm.active);
          SocketService.emit('toggle', vm.active);
          //SocketService.emit('bumpRound',number)
        }

        function checkSquare(guess) {
          if(vm.wordList[guess].type == 'bystander'){
            SocketService.emit('bumpRound', ++vm.roundNumber);
          }
          if(vm.wordList[guess].type == 'assassin'){
            SocketService.emit('bumpRound', 1);
          }
          vm.wordList[guess].reveal = true;
          console.log(vm.playerOne.userId);
          SocketService.emit('guessed', guess)
        }

        SocketService.on('bumpRound', function(number){
          vm.roundNumber = number;
        })

        SocketService.on('notEnoughUsers', function(){
            vm.showGame = false;
            vm.showWait = true;
        });

        SocketService.on('codeWordReturned', function(word){
            vm.returnedWord = word;
        });

        SocketService.on('yourTurn', function(){
          // console.log("toggle: " + toggle);
          if(vm.active == true){
            vm.active = false;
          }else{
            vm.active = true;
          }
          console.log(vm.active);
          //SocketService.emit('bumpRound');
        })

        SocketService.on('startRound', function(users) {
            clearUser();
            prepareUser();
            vm.playerOne = null;
            vm.playerOne = new User(users[0],vm.wordList);
            clearUser();
            prepareUser();
            vm.playerTwo = null;
            vm.playerTwo = new User(users[1],vm.wordList);
            vm.wordList = [];
            vm.playerOne.playerAnswer = vm.playerTwo.playerGrid;
            vm.playerTwo.playerAnswer = vm.playerOne.playerGrid;
            vm.showGame = true;
            vm.showWait = false;
            console.log(vm.answerSheet);
        })

        SocketService.on('returnedAnswers', function(answers){
          vm.wordList = answers;
        });

        SocketService.on('returnGuess', function(guess){
          // console.log(vm.wordList[guess].word+" Has been clicked");
        });

        function loadNumArray() {
            var n = 0;
            var numArray = [];
            while(n <= 24) {
                numArray.push(n);
                n++;
            }
            // console.log(numArray);
            return numArray;
        }

        function loadWordList() {
            vm.words.forEach(function(w) {
                var x = new Card(w, "bystander");
                vm.wordList.push(x);
                vm.answerSheet.push(x);
            });

            // console.log(vm.wordList);

            // console.log("The agents: " + vm.agentNumbers);
            vm.agentNumbers.forEach(function(x) {
               vm.wordList[x].type = "agent";
               vm.answerSheet[x].type = "agent";
            });

            // console.log("The assassins: " + vm.assassinNumbers);
            vm.assassinNumbers.forEach(function(x) {
               vm.wordList[x].type = "assassin";
               vm.answerSheet[x].type = "assassin";
            });

            SocketService.emit('answerSheet', vm.answerSheet);
        };

        function getRandomAgentNumbers() {
            var x;
            while(vm.numArray.length >= 13 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.agentNumbers.push(x[0]);
            }
        }

        function getRandomAssassinNumbers() {
            var x;
            while(vm.numArray.length >= 10 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.assassinNumbers.push(x[0]);
            }
            // console.log(vm.assassinNumbers);
        }
    }
})();
