// student.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('GameController', ['$http','$scope','SocketService', GameController]);

    function GameController($http, scope, SocketService) {
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
        vm.cardList = [];
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
            loadCardList();
        }

        function clearUser() {
            vm.numArray = [];
            vm.numArray = loadNumArray();
            vm.agentNumbers = [];
            vm.assassinNumbers = [];
            vm.cardList = [];
            vm.answerSheet = [];
        }

        vm.getRandomAgentNumbers = getRandomAgentNumbers;
        vm.loadCardList = loadCardList;

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
          vm.active = !vm.active;
          console.log(vm.active);
          SocketService.emit('toggle', vm.active);
          //SocketService.emit('bumpRound',number)
        }

        function checkSquare(guess) {
          if(vm.cardList[guess].type == 'bystander'){
            SocketService.emit('bumpRound', ++vm.roundNumber);
          }
          if(vm.cardList[guess].type == 'assassin'){
            SocketService.emit('bumpRound', 1);
          }
          vm.cardList[guess].reveal = true;
          console.log(vm.playerOne.userId);
          SocketService.emit('guessed', guess)
        }

        SocketService.on('bumpRound', function(number){
          vm.roundNumber = number;
        })

        SocketService.on('isActive', function(toggle){
          vm.active = toggle;
          console.log(vm.active);
        })

        SocketService.on('notEnoughUsers', function(){
            vm.showGame = false;
            vm.showWait = true;
        });

        SocketService.on('codeWordReturned', function(word){
            vm.returnedWord = word;
        });

        SocketService.on('yourTurn', function(){
          vm.active = !vm.active;
          console.log(vm.active);
        })

        SocketService.on('startRound', function(users) {
            clearUser();
            prepareUser();
            vm.playerOne = null;
            vm.playerOne = new User(users[0],vm.cardList);
            clearUser();
            prepareUser();
            vm.playerTwo = null;
            vm.playerTwo = new User(users[1],vm.cardList);
            vm.cardList = [];
            vm.playerOne.playerAnswer = vm.playerTwo.playerGrid;
            vm.playerTwo.playerAnswer = vm.playerOne.playerGrid;
            vm.showGame = true;
            vm.showWait = false;
            // console.log(vm.answerSheet);
        })

        SocketService.on('returnedAnswers', function(answers){
          vm.cardList = answers;
        });

        SocketService.on('returnGuess', function(guess){
          // console.log(vm.cardList[guess].word+" Has been clicked");
        });

        SocketService.on('returnedWords', function(words) {
            vm.words = words;
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

        function getNumbersPromise() {
            return new Promise(function(resolve,reject) {
                var n = 0;
                var numbers = [];
                while(n <= 24) {
                    numbers.push(n);
                    n++;
                }

                resolve(numbers);

                if(numbers.length != 25) {
                    reject("Error: could not determine numbers for grid");
                }
            })
        }

        function loadCardList() {
            vm.words.forEach(function(w) {
                var x = new Card(w, "bystander");
                vm.cardList.push(x);
                vm.answerSheet.push(x);
            });

            // console.log(vm.cardList);

            // console.log("The agents: " + vm.agentNumbers);
            vm.agentNumbers.forEach(function(x) {
               vm.cardList[x].type = "agent";
               vm.answerSheet[x].type = "agent";
            });

            // console.log("The assassins: " + vm.assassinNumbers);
            vm.assassinNumbers.forEach(function(x) {
               vm.cardList[x].type = "assassin";
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

        function getAgentsPromise(numArray) {
            return new Promise(function(resolve,reject) {
                var x;
                var agents = [];
                while(numArray.length >= 13) {
                    x = numArray.splice(Math.floor(Math.random() * numArray.length),1)
                    agents.push(x[0])
                }

                var data = {};
                data.agents = agents;
                data.numbers = numArray;
                resolve(data);

                if(agents == null) {
                    reject("Error: could not get agents");
                }
            ;})
        }

        function getAssassinsPromise(numArray) {
            return new Promise(function (resolve,reject) {
                var x;
                var assassins = [];
                while(numArray.length >= 10 ) {
                    x = numArray.splice(Math.floor(Math.random() * numArray.length),1);
                    assassins.push(x[0]);
                }
                
                var data = {};
                data.assassins = assassins;
                data.numbers = numArray;
                resolve(data);

                if(assassins == null) {
                    rejects("Error: could not allocate assassins");
                }
            });
        }

        function getRandomAssassinNumbers() {
            var x;
            while(vm.numArray.length >= 10 ) {
                x = vm.numArray.splice(Math.floor(Math.random() * vm.numArray.length),1);
                vm.assassinNumbers.push(x[0]);
            }
            // console.log(vm.assassinNumbers);
        }

        function getWordsFromFilePromise() {
            return new Promise(function(resolve,reject) {
                $http.get('../modules/WordFile.txt')
                    .then(function (words) {
                        var wordArray = words.data.split('\n');
                        resolve(wordArray);
                    }, function(error) {
                        reject(error);
                    });
                });
        };

        function getWordsPromise(wordArray) {
            return new Promise(function(resolve,reject) {
                var i = 24;
                var x = [];
                var words = [];
                while(i >= 0) {
                    x = wordArray.splice(Math.floor(Math.random() * wordArray.length),1);
                    words.push(x[0]);
                    i = i - 1;
                }

                resolve(words);

                if(words == []) {
                    reject("Error: could not assign words");
                }
            })
        }

        function loadWords() {
            return new Promise(function(resolve,reject) {
                getWordsFromFilePromise()
                .then(function(wordArray) {
                    console.log(wordArray);
                    return getWordsPromise(wordArray);
                })
                .then(function(wordArray) {
                    console.log(wordArray);
                    SocketService.emit('wordsSent', wordArray);
                    resolve("resolved");
                });
            });
        }

        getNumbersPromise()
            .then(function(numbers) {
                console.log(numbers);
                return getAgentsPromise(numbers);
            })
            .then(function(data) {
                console.log("The agents are" + data.agents);
                console.log("The remaining numbers:" + data.numbers);
                return getAssassinsPromise(data.numbers);
            })
            .then(function(data) {
                console.log("The assassins are" + data.assassins);
                console.log("The remaining numbers: + data.numbers");
            })
            .catch(function(error) {
                console.log("Failed!",error);
            });
    }
})();
