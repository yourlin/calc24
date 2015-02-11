//初始化代码
//产生随机数并显示
function gameConfig() {
  this.numbers = new Array(); //随机数数组
  this.result = 0; //计算结果
  this.gameTimer; //计时器
  this.sorce = 0; //得分
  this.timerCount = 60; //初始化计时秒数
  this.moves = 0; //移动的次数
  this.brackets = 0; //括号类型

  this.numbersPerm = new Array(); //随机数排列序列数组
  this.operatorCombines = new Array(); //操作符组合序列数组

  return this;
}

var config = gameConfig();

//重置计时器
function resetGame() {
  $("#timer").text(this.timerCount);
  clearInterval(config.gameTimer);
}

function addToNumbers(element) {
  config.numbersPerm.push(element);
}

function addToOPs(element) {
  config.operatorCombines.push(element);
}

//检查当前序列，是否可用
function isAvailableFormula() {
  config.numbersPerm.length = 0;
  config.operatorCombines.length = 0;
  perm(config.numbers, 4, addToNumbers);
  combin(["+", "-", "*", "/"], 3, addToOPs);

  for (var i = 0; i < config.numbersPerm.length; i++) {
    for (var j = 0; j < config.operatorCombines.length; j++) {
      var formula = config.numbersPerm[i][0] + config.operatorCombines[j][0] + config.numbersPerm[i][1] + config.operatorCombines[j][1] + config.numbersPerm[i][2] + config.operatorCombines[j][2] + config.numbersPerm[i][3];
      if (eval(formula) == 24) {
        return true;
      }

      formula = "(" + config.numbersPerm[i][0] + config.operatorCombines[j][0] + config.numbersPerm[i][1] + ")" + config.operatorCombines[j][1] + config.numbersPerm[i][2] + config.operatorCombines[j][2] + config.numbersPerm[i][3];
      if (eval(formula) == 24) {
        return true;
      }

      formula = config.numbersPerm[i][0] + config.operatorCombines[j][0] + "(" + config.numbersPerm[i][1] + config.operatorCombines[j][1] + config.numbersPerm[i][2] + ")" + config.operatorCombines[j][2] + config.numbersPerm[i][3];
      if (eval(formula) == 24) {
        return true;
      }

      formula = config.numbersPerm[i][0] + config.operatorCombines[j][0] + config.numbersPerm[i][1] + config.operatorCombines[j][1] + "(" + config.numbersPerm[i][2] + config.operatorCombines[j][2] + config.numbersPerm[i][3] + ")";
      if (eval(formula) == 24) {
        return true;
      }

      formula = "(" + config.numbersPerm[i][0] + config.operatorCombines[j][0] + config.numbersPerm[i][1] + ")" + config.operatorCombines[j][1] + "(" + config.numbersPerm[i][2] + config.operatorCombines[j][2] + config.numbersPerm[i][3] + ")";
      if (eval(formula) == 24) {
        return true;
      }

      formula = "(" + config.numbersPerm[i][0] + config.operatorCombines[j][0] + config.numbersPerm[i][1] + config.operatorCombines[j][1] + config.numbersPerm[i][2] + ")" + config.operatorCombines[j][2] + config.numbersPerm[i][3];
      if (eval(formula) == 24) {
        return true;
      }

      formula = config.numbersPerm[i][0] + config.operatorCombines[j][0] + "(" + config.numbersPerm[i][1] + config.operatorCombines[j][1] + config.numbersPerm[i][2] + config.operatorCombines[j][2] + config.numbersPerm[i][3] + ")";
      if (eval(formula) == 24) {
        return true;
      }
    }
  }

  return false;
};

function showResult(result) {
  document.write(result);
  document.write("<br>");
};

/*
排列（递归链接）算法
1、设定源数组为输入数组，结果数组存放排列结果（初始化为空数组）；
2、逐一将源数组的每个元素链接到结果数组中（生成新数组对象）；
3、从原数组中删除被链接的元素（生成新数组对象）；
4、将新的源数组和结果数组作为参数递归调用步骤2、3，直到源数组为空，则输出一个排列。
*/
function perm(arr, count, callback) {
  if (arr.length < count) {
    alert("参数错误");
  };
  (function fn(source, result) {
    if (source.length == arr.length - count)
      callback(result);
    else
      for (var i = 0; i < source.length; i++)
        fn(source.slice(0, i).concat(source.slice(i + 1)), result.concat(source[i]));
  })(arr, []);
}

//组合算法
function combin(arr, count, callback) {
  if (arr.length < count) {
    alert("参数错误");
  };

  (function fn(source, result) {
    //结果的个数等于指定长度
    if (result.length == count) {
      callback(result);
      return;
    }

    for (var i = 0; i < source.length; i++) {
      fn(source, result.concat(source[i]));
    }
  })(arr, []);
}

//设置计时器
function startGame() {
  resetGame();

  //设置拖放
  $(".calc .num").draggable({
    helper: "clone"
  });
  $(".calc .num").droppable({
    accept: ".calc div",
    activeClass: "ui-state-hover",
    hoverClass: "ui-state-active",
    drop: function(event, ui) {
      var val = $(this).text();
      $(this).text(ui.helper.text());
      ui.draggable.text(val);
      resetBrackets();
      reCalc();
    }
  });

  while (true) {
    for (i = 0; i < 4; i++) {
      config.numbers[i] = Math.floor(Math.random() * 13 + 1);
      $("#num" + i).text(config.numbers[i]);
    }
    op1 = $("#op1").val();
    op2 = $("#op2").val();
    op3 = $("#op3").val();
    //添加规则判断，是否可以计算出24
    isAvailableFormula();

    formula = config.numbers[0] + op1 + config.numbers[1] + op2 + config.numbers[2] + op3 + config.numbers[3];
    config.result = eval(formula);

    //默认值不能是24
    if (config.result != 24) {
      break;
    };
  }

  $("#start").hide();
  $("#bracketsOptions").show();
  $(".calc").show();
  $("#score").show();
  $(".timerdiv").show();
  $("#result").text(config.result);
  $(".timer").text(config.timerCount);
  config.gameTimer = setInterval(function() {
    remainTime = parseInt($(".timer").text());
    remainTime--;
    $(".timer").text(remainTime);
    if (remainTime == 0) {
      clearInterval(config.gameTimer);
      loseGame();
      return;
    };
  }, 1000);
}

$("#start").click(function(event) {
  startGame();
});

//操作符改变后重新计算
$("select").change(function(event) {
  resetBrackets();
  reCalc();
});

//重置括号的位置
function resetBrackets(){
  for (i = 0; i < 4; i++) {
    $("#num" + i).text(
      $("#num" + i).text().replace('(', '').replace(')', '')
    );
  }

  addBrackets(config.brackets);
}

function reCalc() {
  var num = new Array();
  for (i = 0; i < 4; i++) {
    num[i] = $("#num" + i).text();
    config.numbers[i] = parseInt(num[i].replace('(', '').replace(')', ''));
  }
  op1 = $("#op1").val();
  op2 = $("#op2").val();
  op3 = $("#op3").val();
  formula = num[0] + op1 + num[1] + op2 + num[2] + op3 + num[3];
  config.result = eval(formula);
  $("#result").text(config.result);
  if (config.result == 24) {
    winGame();
  } else {
    $("#tips").hide();
  }
};

function winGame() {
  $("#tips").text('恭喜你，答案正确，游戏胜利！');
  $("#tips").show();
  frozeScreen();
};

function loseGame() {
  $("#tips").text('很遗憾，时间到了，游戏失败！');
  $("#tips").show();
  frozeScreen();
  //todo计算得分
}

function frozeScreen() {
  $(".calc .num").draggable({
    disabled: true
  });
  $(".calc .num").droppable({
    disabled: true
  });
  $("select").attr("disabled", "disabled");
}

function addBrackets(index) {
  config.brackets = index;
  for (i = 0; i < 4; i++) {
    config.numbers[i] = parseInt($("#num" + i).text().replace('(', '').replace(')', ''));
  }

  switch (index) {
    case 0:
      $("#num0").text(config.numbers[0]);
      $("#num1").text(config.numbers[1]);
      $("#num2").text(config.numbers[2]);
      $("#num3").text(config.numbers[3]);
      break;
    case 1:
      $("#num0").text('(' + config.numbers[0]);
      $("#num1").text(config.numbers[1] + ')');
      $("#num2").text(config.numbers[2]);
      $("#num3").text(config.numbers[3]);
      break;
    case 2:
      $("#num0").text(config.numbers[0]);
      $("#num1").text(config.numbers[1]);
      $("#num2").text('(' + config.numbers[2]);
      $("#num3").text(config.numbers[3] + ')');
      break;
    case 3:
      $("#num0").text('(' + config.numbers[0]);
      $("#num1").text(config.numbers[1] + ')');
      $("#num2").text('(' + config.numbers[2]);
      $("#num3").text(config.numbers[3] + ')');
      break;
    case 4:
      $("#num0").text('(' + config.numbers[0]);
      $("#num1").text(config.numbers[1]);
      $("#num2").text(config.numbers[2] + ')');
      $("#num3").text(config.numbers[3]);
      break;
    case 5:
      $("#num0").text(config.numbers[0]);
      $("#num1").text('(' + config.numbers[1]);
      $("#num2").text(config.numbers[2]);
      $("#num3").text(config.numbers[3] + ')');
      break;
  }

  reCalc();
}
