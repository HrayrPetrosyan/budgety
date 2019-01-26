//Budget Controller
var budgetController = (function() {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome) {

    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    } else {
      this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
}

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    })
    data.totals[type] = sum;

  }

  var data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1,
  }

    return {
      addItem: function(type, des, val) {
        var newItem, id;

        //Create new id
        if (data.allItems[type].length > 0) {
          id = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          id = 0;
        }


        // create new item based on 'expense' or 'income' type
        if (type === 'expense') {
          newItem = new Expense(id, des, val)
        } else if (type === 'income') {
          newItem = new Income(id, des, val)
        }

        // push into the data structure
        data.allItems[type].push(newItem);
        //return new item
        return newItem;
      },
      deleteItem: function(type, id) {
        var ids, index;

        ids = data.allItems[type].map(function(current) {
          return current.id;
        });

        index = ids.indexOf(id);

        if (index !== -1) {
          data.allItems[type].splice(index, 1);
        }
      },

      calculatePercentages: function() {

        data.allItems.expense.forEach(function(cur) {
          cur.calcPercentage(data.totals.income);
        })
      },
      getPercentages: function() {
        var allPerc = data.allItems.expense.map(function(cur) {
          return cur.getPercentage();
        });
        return allPerc;
      },

      calculateBudget: function() {

        // calculate total income and expenses
        calculateTotal('expense');
        calculateTotal('income');

        // calculate the budget: income - expenses
        data.budget = data.totals.income - data.totals.expense;

        // calculate the percentage of income that we spend
        if (data.totals.income > 0) {
          data.percentage = Math.round(data.totals.expense / data.totals.income * 100);
        } else {
          data.percentage = -1;
        }

      },
      testing: function () {
        console.log(data);
      },
      getBudget: function() {
        return {
          budget: data.budget,
          totalInc: data.totals.income,
          totalExp: data.totals.expense,
          percentage: data.percentage
        }
      }
    }


})();

//UI Controller
var uiController = (function () {

  var  domstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var nodeListForEach = function(list, callback) { // loops as many time as labels are
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i); // the function to refer each percentage label and its index
    }
  };

  var format = function(num) {

    num = num.toLocaleString()

    return num
  };

  return {
    getinput: function() {
      return {
      type: document.querySelector(domstrings.inputType).value, // income or expense
      description: document.querySelector(domstrings.inputDescription).value,
      value: parseFloat(document.querySelector(domstrings.inputValue).value),
    }
  },
    getDOMstrings: function () {
      return domstrings;
    },
    addListItem: function (obj, type) {
      var html, newhtml, element;
      //HTML with placeholder text
      if (type === 'income') {
        element = domstrings.incomeContainer;
      html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    } else if (type === 'expense') {
      element = domstrings.expensesContainer;
      html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }

    // Replacethe placeholder text with some actual data
    newhtml = html.replace('%id%', obj.id);
    newhtml = newhtml.replace('%description%', obj.description);
    newhtml = newhtml.replace('%value%', format(obj.value));

    // Insert the HTML into the DOM
    document.querySelector(element).insertAdjacentHTML('beforeend', newhtml)
  },
  deleteListItem: function(selectorID) {

    var el = document.getElementById(selectorID);

    el.parentNode.removeChild(el);

  },
  clearFields: function() {
    var fields, fieldsArr;

    fields = document.querySelectorAll(domstrings.inputDescription + ', ' + domstrings.inputValue);

    fieldsArr = Array.prototype.slice.call(fields);

    fieldsArr.forEach(function(current, index, array) {
      current.value = '';
    });

    fieldsArr[0].focus();
  },
  displayBudget: function (obj) {

    document.querySelector(domstrings.budgetLabel).textContent = '+ ' + format(obj.budget);
    document.querySelector(domstrings.incomeLabel).textContent = '+ ' + format(obj.totalInc);
    document.querySelector(domstrings.expenseLabel).textContent = '- ' + format(obj.totalExp);

    if (obj.percentage > 0) {
      document.querySelector(domstrings.percentageLabel).textContent = obj.percentage + '%';
    } else {
      document.querySelector(domstrings.percentageLabel).textContent = '---';

    }
  },
  displayPercentages: function(percentages) {
    // list of the percentage labels
    var fields = document.querySelectorAll(domstrings.expensesPercLabel); // list of all percentage labels
    // because the lists don't have forEach method creating For loop
    var nodeListForEach = function(list, callback) { // loops as many time as labels are
      for (var i = 0; i < fields.length; i++) {
        callback(list[i], i); // the function to refer each percentage label and its index
      }
    };
    // callback function for the for loop
    nodeListForEach(fields, function(current, index) {
      if (percentages[index] > 0) {
        current.textContent = percentages[index] + '%'; // label in index is being filled with percentage index
      } else {
        current.textContent = '---';
      }
    })
  },
  displayMonth: function() {
    var now, year, month, months;

    now = new Date();
    months = ['January', 'Fabruary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    month = now.getMonth();
    year = now.getFullYear();

    document.querySelector(domstrings.dateLabel).textContent = months[month] + ' ' + year;

  },
  changedType: function() {

    var fields = document.querySelectorAll(
      domstrings.inputType + ',' +
      domstrings.inputDescription + ',' +
      domstrings.inputValue
    );

    nodeListForEach(fields, function(cur) {
      cur.classList.toggle('red-focus');
    });

    document.querySelector(domstrings.inputBtn).classList.toggle('red');
  }



  };


})();

// Gobal App Controller
var controller = ( function (budgetCtrl, uiCtrl) {
  //Enter or button click activates ctrlAddItem function
  var setupEventListeners = function() {
    document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }
  });
    document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
};

  var dom = uiCtrl.getDOMstrings()

  var updateBudget = function() {

    // 1. Calculate the Budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    uiCtrl.displayBudget(budget);
  }

  var updatePercentage = function() {
    // 1. Calculate the percentage
    budgetCtrl.calculatePercentages();
    // 2. Get the percentage
    percentages = budgetCtrl.getPercentages();
    // 3. Update UI percentage fields
    uiCtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = function() {

    var input, newItem;

    // 1. Get the field input data
    input = uiCtrl.getinput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {


    // 2. Add the item to the budget Controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    // 3. Add the item to the UI
    uiCtrl.addListItem(newItem, input.type);

    // 4. Clear  the fields
    uiCtrl.clearFields();

    // 5. Calculate and update the budget
    updateBudget();

    // 6. Update the percentage
    updatePercentage();
      }
  }

  var ctrlDeleteItem = function(event) {
    var itemID, splitID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data
      budgetCtrl.deleteItem(type, ID);
      // 2. delete the item from the UI
      uiCtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();
      // 4. Update the percentage
      updatePercentage();
    }
  }

  return {
    init: function() {
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    },
  }

})(budgetController, uiController);

controller.init();
