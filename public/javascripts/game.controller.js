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
        vm.codePrompt = "Give your hint!";
        vm.words = [];
        vm.selectedIndex = [-1];
        vm.showGame;
        vm.showLoad;
        vm.showWait;

        // Functions
        vm.checkSquare = checkSquare;
        vm.squareSelected = squareSelected;
        vm.endRound = endRound;
        vm.addMessage = addMessage;
        vm.guessedWord;
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
            loadCardList();
            vm.agentNumbers = [];
            vm.assassinNumbers = [];
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
          SocketService.emit('toggle');
          //SocketService.emit('bumpRound',number)
        }

        function checkSquare(guess) {
          if(vm.wordList[guess].type == 'bystander'){
            vm.active = !vm.active;
            vm.guessedWord="";
            console.log(vm.active);
            SocketService.emit('toggle');
          }
          if(vm.cardList[guess].type == 'assassin'){
            SocketService.emit('bumpRound', 1);
          }
          
          vm.wordList[guess].reveal = true;
          SocketService.emit('guessed', guess)
        }

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

        function getCardWords() {
            return new Promise(function(resolve,reject) {
                getWordsFromFilePromise()
                .then(function(wordArray) {
                    console.log(wordArray);
                    return getWordsPromise(wordArray);
                })
                .then(function(wordArray) {
                    resolve(wordArray);
                })
                .catch(function(error) {
                    reject(error);
                });
            });
        }


        function getCardTypes() {
            return new Promise(function(resolve,reject) {
                getNumbersPromise()
                .then(function(numbers) {
                    return getAgentsPromise(numbers);
                })
                .then(function(data) {
                    vm.agentNumbers = data.agents;
                    console.log("The agents are" + data.agents);
                    return getAssassinsPromise(data.numbers);
                })
                .then(function(data) {
                    vm.assassinNumbers = data.assassins;
                    console.log("The assassins are" + data.assassins);
                    resolve("Finished getting card types.");
                })
                .catch(function(error) {
                    reject(error);
                });
            })
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
            SocketService.emit('bumpRound', ++vm.roundNumber);
          })
  
          SocketService.on('startRound', function(users) {
              getCardWords()
                  .then(function(wordArray) {
                      if(!vm.active){
                          vm.words = wordArray;
                      }
                      SocketService.emit('wordsSent', wordArray, users);
                  })
          })
  
          SocketService.on('returnedAnswers', function(answers){
            vm.wordList = answers;
          });
  
          SocketService.on('returnGuess', function(guess){
            vm.guessedWord = vm.wordList[guess].word;
          });
  
          SocketService.on('returnedWords', function(words, users) {
              vm.words = words;
  
              console.log(vm.words);
              getCardTypes()
                  .then(function(response) {
                      vm.cardList = [];
                      vm.answerSheet = [];
                      prepareUser();
                      vm.playerOne = null;
                      vm.playerOne = new User(users[0],vm.cardList);
                      return getCardTypes();
                  })
                  .then(function(response){
                      vm.cardList = [];
                      vm.answerSheet = [];
                      prepareUser();
                      vm.playerTwo = null;
                      vm.playerTwo = new User(users[1],vm.cardList);
                      return getCardTypes();
                  })
                  .then(function(response) {
                      vm.cardList = [];
                      vm.playerOne.playerAnswer = vm.playerTwo.playerGrid;
                      vm.playerTwo.playerAnswer = vm.playerOne.playerGrid;
                      vm.showGame = true;
                      vm.showWait = false;
                  })
                  .catch(function(error) {
                      console.log(error);
                  })
          });
    }
})();
