//初始化代码
//产生随机数并显示
function gameConfig() {
  this.numbers = new Array();
  this.result = 0;
  this.gameTimer;
  this.sorce = 0;

  return this;
};

var config = gameConfig(),
  fullPermutationNumbers = new Array();

//重置计时器
function resetGame() {
  $("#timer").text('60');
  clearInterval(config.gameTimer);
};

//检查当前序列，是否可用
function isAvailableFormula(result) {
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

  (function fn(source, result, item) {
    var item = 0;
    if (item == count) {
      callback(result);
      item = 0;
    } else
      for (var i = 0; i < source.length; i++) {
        item++;
        fn(source, result.concat(source[i]), item);
      }
  })(arr, [], 0);
}

//设置计时器
function startGame() {
  resetGame();

  //设置拖放
  $(".calc div").draggable({
    helper: "clone"
  });
  $(".calc div").droppable({
    accept: ".calc div",
    activeClass: "ui-state-hover",
    hoverClass: "ui-state-active",
    drop: function(event, ui) {
      var val = $(this).text();
      $(this).text(ui.helper.text());
      ui.draggable.text(val);
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
    //TODO： 添加规则判断，是否可以计算出24
    isAvailableFormula();

    formula = config.numbers[0] + op1 + config.numbers[1] + op2 + config.numbers[2] + op3 + config.numbers[3];
    config.result = eval(formula);

    //默认值不能是24
    if (config.result != 24) {
      break;
    };
  }
  $("#result").text(config.result);
  config.gameTimer = setInterval(function() {
    remainTime = parseInt($("#timer").text());
    remainTime--;
    if (remainTime == 0) {
      clearInterval(config.gameTimer);
      return;
    };

    $("#timer").text(remainTime);
  }, 1000);
};

$("#start").click(function(event) {
  startGame();
});

//操作符改变后重新计算
$("select").change(function(event) {
  reCalc();
});

function reCalc() {
  for (i = 0; i < 4; i++) {
    config.numbers[i] = parseInt($("#num" + i).text());
  }
  op1 = $("#op1").val();
  op2 = $("#op2").val();
  op3 = $("#op3").val();
  formula = config.numbers[0] + op1 + config.numbers[1] + op2 + config.numbers[2] + op3 + config.numbers[3];
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
};

function loseGame() {
  $("#tips").text('很遗憾，时间到了，游戏失败！');
  $("#tips").show();
};
