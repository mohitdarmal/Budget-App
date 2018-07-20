var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };



    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function () {
            // Calculate total income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget income - expense
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function () {
            var allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data)
        }
    };

})();





//UI Controller =============================================================================
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        incomeLable: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetLable: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);

        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';        
        // return type + ' ' + int + dec;
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            //Create HTML string with placeholder text
            var element, html, newHtml;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFeilds: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fields[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            var nodeListForEach = function (list, callback) {
                for (i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            })
        },



        deleteItemList: function (slectorId) {
            var deleteId = document.getElementById(slectorId);
            deleteId.parentNode.removeChild(deleteId);
        },

        displayMonth: function () {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();






//Global App Controller=======================================================================
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListener = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }


    var updateBudget = function () {
        //calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        budget = budgetCtrl.getBudget();

        // Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFeilds();

            // 5. update budget
            updateBudget();

            // 6. update percentage
            updatePercentage();

        }
    };

    var updatePercentage = function () {
        // 1. Calculate Percentage
        budgetCtrl.calculatePercentage();
        // 2.  Read Percentages from the budget controller
        var percentages = budgetCtrl.getPercentage();
        // 3.  Update the UI with the new percentage
        UICtrl.displayPercentages(percentages);
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splittId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splittId = itemId.split('-');
            type = splittId[0];
            ID = parseInt(splittId[1]);

            //1. Delete the id from data structure
            budgetCtrl.deleteItem(type, ID);
            //Delete the item from UI
            UICtrl.deleteItemList(itemId);

            //update and show the new budget
            updateBudget();

            // 6. update percentage
            updatePercentage();
        }
    };




    return {
        init: function () {
            setupEventListener();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }


})(budgetController, UIController);

controller.init();