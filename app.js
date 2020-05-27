// BUDGET CONTROLLER
let budgetController = (function(){
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;    
        });
        data.totals[type] = sum;
    };
    return {
        addItem: function(type, des, val){
            let newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }
            
            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            } else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id){
            let ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
             calculateTotal("exp");
             calculateTotal("inc");
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage =-1;
            }
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return{
                budget: data.budget,
                income: data.totals.inc,
                expense: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    };

})();


// UI CONTROLLER
let UIController = (function(){
    let domStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        expenseContainer: ".expenses__list",
        incomeContainer: ".income__list",
        totalIncomeLabel: ".budget__income--value",
        totalExpensesLabel: ".budget__expenses--value",
        expensePercentageLabel: ".budget__expenses--percentage",
        budgetLabel: ".budget__value",
        container: ".container",
        expListPercentagesLbl: ".item__percentage",
        dateLabel: ".budget__title--month"
    };
    let formatNumber = function(num, type){
        let numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    let nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i);
        } 
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(domStrings.inputType).value, // will be either inc or exp
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            let html, newHtml, element;
          
          if(type === "inc"){
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = domStrings.incomeContainer;
            } else if(type === "exp"){
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = domStrings.expenseContainer;
                } 
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        
        },
        deleteListItem: function(selectorId){
            let el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        displayBudget: function(obj){
            let type;
            if(obj.budget > 0){
                type = "inc";
            } else {
                type = "exp";
            }
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.totalIncomeLabel).textContent = formatNumber(obj.income, "inc");
            document.querySelector(domStrings.totalExpensesLabel).textContent = formatNumber(obj.expense, "exp");
            if(obj.percentage > 0){
                document.querySelector(domStrings.expensePercentageLabel).textContent = obj.percentage + "%";
            } else{
                document.querySelector(domStrings.expensePercentageLabel).textContent = "---";
            }
        },
        clearFields: function(){
            let fields, fieldsArr;
            fields = document.querySelectorAll(domStrings.inputDescription + "," + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayPercentages: function(percentagesArr){
            let percentageFields = document.querySelectorAll(domStrings.expListPercentagesLbl);
           
            nodeListForEach(percentageFields, function(current, index){
                if(percentagesArr[index] > 0){
                    current.textContent = percentagesArr[index] + "%";
                } else{
                    current.textContent ="---";
                }
            });
        },
        displayDate: function(){
            let now, months, month, year;
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + " " + year;
        },
        changedType: function(){
            let fields = document.querySelectorAll(
                domStrings.inputType + "," +
                domStrings.inputDescription + "," +
                domStrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });
            document.querySelector(domStrings.inputButton).classList.toggle("red");
        },
        DOMStrings: domStrings
    };
})();


// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){
    let input, newItem;

    let setupEventListeners = function(){
        let domValues = UICtrl.DOMStrings;
        document.querySelector(domValues.inputButton).addEventListener("click", ctrlAddItem);
        // would it be better if I attach the event listener to the input field?
        document.addEventListener("keypress", function(event){
         if(event === 13 || event.which === 13){
            ctrlAddItem();
         }
        });
        document.querySelector(domValues.container).addEventListener("click", ctrlDeletItem);
        document.querySelector(domValues.inputType).addEventListener("change", UICtrl.changedType);
    };

    let updateBudget = function(){
        // 4. Calculate the budget
        budgetCtrl.calculateBudget();
        // get the budget
        let budget = budgetCtrl.getBudget();
        // 5. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
        
    };
    let updatePercentages = function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the name percentages
        UICtrl.displayPercentages(percentages);
    };
    
    let ctrlAddItem = function(){
        // 1. Get the field input data
            input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        // 2. Add the item to the budget controller
            newItem =budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        // 4. clear the fields
        UICtrl.clearFields();
        // 5. calculate and update budget
            updateBudget();
        // 6. calculate and update percentages
            updatePercentages();
        }
            
    };

    let ctrlDeletItem = function(event){
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init: function(){
            console.log("application has started");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();