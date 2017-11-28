// student.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('GameController', ['$scope','SocketService', GameController]);

    function GameController($scope, SocketService) {
        var vm = this;
        //Variables

        vm.words = ['Pants', 'Fan', 'Australia', 'Part', 'Dinosaur', 'Carrot',
                       'Mass', 'Vacuum','Row','Iron','Chair','Bomb','Embassy','Paper',
                       'Africa','Mint','Maple','Bat','Ship','Bear','Line',
                       'Note','Fire','Glass','Key'];

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
            SocketService.emit('codeWordSent', vm.codeWord);
            vm.codeWord = ""
        }

        function squareSelected(guess){
          if(guess.reveal){
            return true;
          }else{
            return false;
          }
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
            // console.log(numArray);
            return numArray;
        }

        function loadWordList() {
            vm.words.forEach(function(w) {
                var x = new Person(w, "bystander");
                vm.wordList.push(x);
                vm.answerSheet.push(x);
            });

            // console.log(vm.wordList);


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

            // console.log(vm.agentNumbers);
            // console.log(vm.numArray);

            getRandomAssassinNumbers();
        }

        function getRandomAssassinNumbers() {
            var x;
            while(vm.numArray.length >= 10 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.assassinNumbers.push(x[0]);
            }

            // console.log(vm.assassinNumbers);

            loadWordList();
            // console.log(vm.wordList);
        }

        getRandomAgentNumbers();

    }
})();
