// book.controller.js
(function() {
    'use strict';

    angular
        .module('app')
        .controller('BookController', BookController);

    function BookController() { 
        var vm = this;
        //ISBN number, Name, Author, Publisher, Year, Type, and Edition -->
        vm.books = (localStorage.getItem('books') !== null) ? JSON.parse(localStorage.getItem('books')) : [];
        vm.numberText = '';
        vm.nameText = '';
        vm.authorText = '';
        vm.publisherText = '';
        vm.yearText = '';
        vm.typeText = '';
        vm.editionText = '';
        vm.valid = 'false';
        vm.inStock = getNumInStock();
        vm.outOfStock= getNumOutOfStock();
        vm.showError = false;
        vm.errorMsg = '';
        
        // Functions
        vm.addBook= addBook;
        vm.checkInput = checkInput;
        vm.clearBookInput = clearBookInput;
        vm.getNumInStock = getNumInStock;
        vm.archiveBooks = archiveBooks;
        vm.toggleStock = toggleStock;
        vm.loadBooks = loadBooks;
        vm.getNumOutOfStock = getNumOutOfStock;
    
        function addBook() {
            vm.showError = false;
            vm.errorMsg = '';
            vm.checkInput();
            if(vm.valid == true) {
                vm.books.push( {number:vm.numberText, name:vm.nameText, author:vm.authorText, publisher:vm.publisherText, year:vm.yearText, type:vm.typeText, edition:vm.editionText, stocked:true }) ;
                vm.clearBookInput();
                vm.archiveBooks();
            }
            else {
                vm.showError = true;
            }
        }

        function archiveBooks() { 
            var oldBooks = vm.books;
            localStorage.setItem('books', JSON.stringify(vm.books));
            vm.loadBooks();
        }

        function clearBookInput() {
            vm.numberText = '';
            vm.nameText = '';
            vm.authorText = '';
            vm.publisherText = '';
            vm.yearText = '';
            vm.typeText = '';
            vm.editionText = '';
        }

        function checkInput() {
            vm.valid = true;
            if(vm.numberText == '' || vm.nameText == '' || vm.authorText == '' || vm.publisherText == '' || vm.yearText == '' || vm.typeText == '' || vm.editionText == '' ) {
                vm.valid = false;
                vm.errorMsg = "Error: All input fields must be used"
            }

            if (/[a-zA-Z]/.test(vm.numberText)) {
                vm.valid = false;
                vm.errorMsg = "Error: ISBN number cannot contain letters"
            }

            /* Note : I did not test bookname for numbers since some books use them like Orwell's "1984" */
            
            if (/[0-9]/.test(vm.authorText)) {
                vm.valid = false;
                vm.errorMsg = "Error: Author name cannot contain a number"
            }

            if (/[a-zA-Z]/.test(vm.yearText)) {
                vm.valid = false;
                vm.errorMsg = "Error: Year cannot contain letters"
            }

            if (/[0-9]/.test(vm.typeText)) {
                vm.valid = false;
                vm.errorMsg = "Error: Type cannot contain a number"
            }
            
            console.log(vm.numberText);
            console.log(vm.valid);
            console.log(vm.errorMsg);
        }

        function getNumInStock() {
            var count = 0;

            angular.forEach(vm.books, function(book) {
                count += book.stocked ? 1 : 0;
            });

            return count;
        }

        function getNumOutOfStock() {
            var count = 0;
            
            angular.forEach(vm.books, function(book) {
                count += book.stocked ? 0 : 1;
            });

            return count;  
        }

        function loadBooks() {
            vm.books = (localStorage.getItem('books') !== null) ? JSON.parse(localStorage.getItem('books')) : [];
            vm.inStock = getNumInStock();
            vm.outOfStock = getNumOutOfStock();
        }

        function toggleStock(list) {
            var tempbooks = JSON.parse(localStorage.getItem('books'));

            angular.forEach(tempbooks, function(book) {
                if(angular.equals(list.book.number, book.number) && angular.equals(list.book.name, book.name)) {
                    book.stocked = !book.stocked;

                    localStorage.setItem("books", JSON.stringify(tempbooks));
                }

                vm.loadBooks();
            });
        }
        
    }
})();