var generate = {};

generate.geometric = (problem) => {  
  var num = Math.floor(Math.random() * 20 + 1) * (Math.floor(Math.random() * 2) * 2 - 1);
  var den = Math.floor(Math.random() * Math.random() * 50 + 1);
  
  var g = gcd(num, den);
  num /= g;
  den /= g;

  var ex = Math.floor(Math.random() * Math.random() * Math.random() * 5) + 1;

  if (den == 1) {
    problem.expr = "\\left("+num+"\\right)^{"+(ex == 1 ? "" : ex)
                    +problem.letter+"}";
  } else {
    problem.expr = "\\left(\\frac{"+num+"}{"+den+"}\\right)^{"
                    +(ex == 1 ? "" : ex)+problem.letter+"}";
  }

  problem.converges = Math.abs(num / den) < 1;

  return problem;
};

generate.pseries = (problem) => {
  problem.start++;

  var p = Math.floor(Math.random() * 5) + 1;
  var root = Math.floor(Math.random() * Math.random() * 5) + 1;
  var coeff = Math.floor(Math.random() * 20 + 1) * (Math.floor(Math.random() * 2) * 2 - 1);

  if (Math.random() < 0.5) {
    // fraction
    if (root == p) {
      problem.expr = "\\frac{"+coeff+"}{"+problem.letter+"}";
    } else if (root != 1) {
      problem.expr = "\\frac{"+coeff+"}{\\sqrt["+(root == 2 ? "" : root)+"]{"+problem.letter+"^{"+(p == 1 ? "" : p)+"}}}";
    } else {
      problem.expr = "\\frac{"+coeff+"}{"+problem.letter+"^{"+(p == 1 ? "" : p)+"}}";
    }
  } else {
    // negative exponent
    var g = gcd(p, root);
    p /= g;
    root /= g;
    problem.expr = (coeff == -1 ? "-" : coeff) + problem.letter+"^{-"+p+(root == 1 ? "" : "/"+root)+"}";
  }

  problem.converges = p / root > 1;
  console.log(p / root);

  return problem;
}

generate.integral = (problem) => {
  var form = Math.floor(Math.random() * 3);
  if (form == 0) {
    // u' / u for polynomial u
    var upCoeff = Math.random() < 0.5 ? Math.floor(Math.random() * 5 + 1) : 1;
    var downCoeff = upCoeff == 1 && Math.random() < 0.5 ? Math.floor(Math.random() * 5 + 1) : 1;
    var degree = Math.floor(Math.random() * 2 + Math.random() * 3 + 1);
    var u = [];
    var up = [];
    for (var i = 0; i < degree + 1; ++i) {
      u[i] = Math.floor(Math.random() * 10);
      if (i == degree) u[i]++;
    }
    for (var i = 0; i < degree; ++i) {
      up[i] = u[i + 1] * (i + 1);
    }

    u = u.map(v => v * downCoeff);
    up = up.map(v => v * upCoeff);

    var denExpr = arrayToPolynomialString(u, problem.letter);
    var numExpr = arrayToPolynomialString(up, problem.letter);

    problem.expr = "\\frac{"+numExpr+"}{"+denExpr+"}";
    problem.converges = false;
    problem.start++;
  } else if (form == 1) {
    // ln(nk) / n^(a/b)
    var a = Math.floor(Math.random() * 12 + 1);
    var b = Math.floor(Math.random() * 3 + 1);

    var g = gcd(a, b);
    a /= g;
    b /= g;

    var coeff = randomCoeff();
    var k = Math.floor(Math.random() * 9 + 1);

    problem.expr = "\\frac{"+coeff+"\\ln{\\left("+(k == 1 ? "" : k)+problem.letter+"\\right)}}{"+problem.letter+"^{"+(a == b ? "" : a + (b == 1 ? "" : "/" + b))+"}}";
    problem.start++;
    problem.converges = a / b > 1;
  } else if (form == 2) {
    // x^a / (k)^x
    var a = Math.floor(Math.random() * 3 + 1);

    var coeff = randomCoeff();
    var k = Math.random() < 0.2 ? Math.floor(Math.random() * 20)/10 + .1 : Math.random() < 0.8 ? Math.floor(Math.random() * 4 + 1) : "e";

    if (k != 1) {
      problem.expr = "\\frac{"+coeff+problem.letter+"^{"+(a == 1 ? "" : a)+"}}{"+k+"^{"+problem.letter+"}}";
    } else {
      problem.expr = (coeff == 1 ? "" : coeff)+problem.letter+"^{"+(a == 1 ? "" : a)+"}";
    }
    problem.converges = k == "e" || k > 1;
  }

  return problem;
};

generate.comparison = (problem) => {
  var form = Math.floor(Math.random() * 5);
  if (form == 0) {
    // |sin(x)|/x^a
    var coeff1 = randomCoeff();
    var coeff2 = randomCoeff();
    var power = Math.floor(Math.random() * 3 + 1);
    var fun = (["\\sin", "\\cos"])[Math.floor(Math.random() * 2)];
    problem.expr = "\\frac{"+coeff1+"\\left|"+fun+"\\left("+coeff2+problem.letter+"\\right)\\right|}{"+problem.letter+"^{"+(power == 1 ? "" : power)+"}}";
    problem.start++;
    problem.converges = power > 1;
  } else if (form == 1) {
    // 1/u where u is a radical of a polynomial
    var root = Math.floor(Math.random() * 3 + 2);
    var u = randomPolynomialArray();
    var coeff = randomCoeff();
    coeff = coeff == "" ? 1 : coeff == "-" ? -1 : coeff;
    var polynomial = arrayToPolynomialString(u, problem.letter);
    problem.expr = "\\frac{"+coeff+"}{\\sqrt["+(root == 2 ? "" : root)+"]{"+polynomial+"}}";
    problem.start++;
    problem.converges = u.length / root > 1;
  } else if (form == 2) {
    // u/v where u and v are polynomials
    var u = randomPolynomialArray(2);
    var v = randomPolynomialArray(3);
    var us = arrayToPolynomialString(u, problem.letter);
    var vs = arrayToPolynomialString(v, problem.letter);
    problem.expr = "\\frac{"+us+"}{"+vs+"}";
    problem.start++;
    problem.converges = u.length - v.length < -1;
  } else if (form == 3) {
    // 1 / n^(p/r) * ln(n)
    var p = Math.floor(Math.random() * 4 + 1);
    var r = Math.floor(Math.random() * 3 + 1);
    var b = Math.random() < 0.5 ? "e" : Math.floor(Math.random() * 10 + 2);
    var log = (b == "e") ? "\\ln" : b == 10 ? "\\log" : "\\log_{"+b+"}";
    var g = gcd(p, r);
    p /= g;
    r /= g;
    var coeff = randomCoeff();
    coeff = coeff == "" ? 1 : coeff == "-" ? -1 : coeff;
    if (r == 1) {
      problem.expr = "\\frac{"+coeff+"}{"+problem.letter+"^{"+(p==1?"":p)+"}"+log+"{\\left("+problem.letter+"\\right)}}";
    } else {
      problem.expr = "\\frac{"+coeff+"}{"+log+"{\\left("+problem.letter+"\\right)}\\sqrt["+(r==2?"":r)+"]{"+problem.letter+"^{"+(p==1?"":p)+"}}}";
    }
    problem.converges = p / r > 1;
  } else if (form == 4) {
    // a^n / b^n + c^n (or the recip.)
    var a = Math.floor(Math.random() * 20 + 1);
    var b = Math.floor(Math.random() * 20 + 1);
    var c = Math.floor(Math.random() * 20 + 1);
    var num = a + "^" + problem.letter
    var den = b + "^" + problem.letter + " + " + c + "^" + problem.letter;
    if (Math.random() < 0.5) {
      problem.expr = "\\frac{" + num + "}{" + den + "}";
      problem.converges = a < Math.max(b, c);
    } else {
      problem.expr = "\\frac{" + den + "}{" + num + "}";
      problem.converges = a > Math.max(b, c);
    }
  }

  return problem;
};

generate.ratio = (problem) => {
  var form = Math.floor(Math.random() * 3);
  var a = Math.random() < 0.1 ? "e" : Math.floor(Math.random() * 6 + 2);
  var b = Math.random() < 0.1 ? "e" : Math.floor(Math.random() * 6 + 2);
  var c = Math.floor(Math.random() * Math.random() * 3 + 1);
  var p = Math.floor(Math.random() * Math.random() * 5 + 2);
  var recip = Math.random() < 0.5;
  var den;
  var num = a+"^{"+problem.letter+"}";
  if (form == 0) {
    // a^n / n^p (and recip.)
    den = problem.letter+"^{"+p+"}";
    problem.converges = recip;
    problem.start++;
  } else if (form == 1) {
    // a^n / (cn)! (and recip.)
    den = (c==1?"":"\\left("+c)+problem.letter+(c==1?"":"\\right)")+"!";
    problem.converges = !recip;
  } else if (form == 2) {
    // a^n / n!b^n (and recip.)
    den = problem.letter+"!\\,"+b+"^{"+problem.letter+"}";
    problem.converges = !recip;
  }

  if (recip) {
    problem.expr = "\\frac{"+den+"}{"+num+"}";
  } else {
    problem.expr = "\\frac{"+num+"}{"+den+"}";
  }

  return problem;
};

generate.root = (problem) => {
  var form = Math.floor(Math.random() * 3);
  var a = Math.random() < 0.1 ? "e" : Math.floor(Math.random() * 6 + 2);
  var b = Math.random() < 0.1 ? "e" : Math.floor(Math.random() * 6 + 2);
  while (a == b) {
    b = Math.random() < 0.1 ? "e" : Math.floor(Math.random() * 6 + 2);
  }

  var aa = Math.floor(Math.random() * 3) * (Math.floor(Math.random() * 2) * 2 - 1);
  var ba = Math.floor(Math.random() * 3) * (Math.floor(Math.random() * 2) * 2 - 1);

  var coeff = [];
  for (var i = 0; i < 3; ++i) {
    coeff[i] = (Math.floor(Math.random() * 4 + 1) * Math.floor(Math.random() * 2) * 2 - 1);
    if (coeff[i] == 1) coeff[i] = "";
    if (coeff[i] == -1) coeff[i] = "";
    coeff[i] += "";
  }

  var an = (coeff[0] == "" ? "" : coeff[0] + "\\left(") + a + "^{" + problem.letter + (aa == 0 ? "" : aa < 0 ? aa : "+" + aa) + "}" + (coeff[0] == "" ? "" : "\\right)");
  var bn = (coeff[1] == "" ? "" : coeff[1] + "\\left(") + b + "^{" + problem.letter + (ba == 0 ? "" : ba < 0 ? ba : "+" + ba) + "}" + (coeff[1] == "" ? "" : "\\right)");
  var nn = (coeff[2] == "" ? "" : coeff[2] + "\\left(") + problem.letter + "^{" + problem.letter + "}" + (coeff[2] == "" ? "" : "\\right)");
  
  if (form == 0) {
    // a^n / n^n
    problem.expr = "\\frac{"+an+"}{"+nn+"}";
    problem.converges = true;
  } else if (form == 1) {
    // n^n / a^n
    problem.expr = "\\frac{"+nn+"}{"+an+"}";
    problem.converges = false;
  } else if (form == 2) {
    // a^n / b^n
    problem.expr = "\\frac{"+an+"}{"+bn+"}";
    if (a == 'e') {
      problem.converges = b >= 3;
    } else if (b == 'e') {
      problem.converges = a <= 2;
    } else {
      problem.converges = a < b;
    }
  }

  return problem;
};

generate.alternating = (problem) => {
  var form = Math.floor(Math.random() * 4);
  var aCoeff = Math.floor(Math.random() * 7 + 1);
  while (aCoeff % 2 == 0 && Math.random() < 0.7) aCoeff /= 2;
  var alternating = "(-1)^{"+(aCoeff == 1 ? "" : aCoeff)+problem.letter+(Math.random() < 0.5 ? "+1" : "")+"}";
  var coeff = Math.floor(Math.random() * 5 + 1);
  coeff = coeff == "1" ? "" : coeff;
  var constant = Math.floor(Math.random() * 9 + 1);
  var linear = coeff + problem.letter + (Math.random() < 0.3 ? "" : "+"+constant); 
  if (form == 0) {
    // (-1)^n+1 / kn + b
    problem.start++;
    problem.expr = "\\frac{"+alternating+"}{"+linear+"}";
    problem.converges = aCoeff == "-" || aCoeff == "" || (~~aCoeff) % 2 != 0;
  } else if (form == 1) {
    // (-1)^n / sqrt(kn + b)
    problem.start++;
    problem.expr = "\\frac{"+alternating+"}{\\sqrt{"+linear+"}}";
    problem.converges = aCoeff == "-" || aCoeff == "" || (~~aCoeff) % 2 != 0;
  } else if (form == 2) {
    // cos(npi) / kn + b
    var fun = (["\\sin", "\\cos"])[Math.floor(Math.random() * Math.random() * 2)];
    problem.start++;
    problem.expr = "\\frac{"+fun+"\\left("+problem.letter+"\\pi"+"\\right)"+"}{\\sqrt{"+linear+"}}";
    problem.converges = true;
  } else if (form == 3) {
    // (-1)^n ln(n)/n^b
    var u = randomPolynomialArray(2);
    var us = arrayToPolynomialString(u, problem.letter);        
    var b = Math.random() < 0.5 ? "e" : Math.floor(Math.random() * 10 + 2);
    var log = (b == "e") ? "\\ln" : b == 10 ? "\\log" : "\\log_{"+b+"}";
    problem.start++;
    problem.expr = "\\frac{"+alternating+log+"\\left("+problem.letter+"\\right)}{"+us+"}";
    problem.converges = aCoeff == "-" || aCoeff == "" || (~~aCoeff) % 2 != 0 || u.length > 1;
  }

  return problem;
};

function generateProblem () {
  var types = ["geometric", "pseries", "integral", "comparison", "ratio", "root", "alternating"];
  var config = [];

  for (var i = 0; i < types.length; ++i) {
    if ($("#" + types[i]).is(":checked")) {
      config.push(types[i]);
    }
  }

  if (config.length == 0) {
    config = types;
  }

  var type = config[Math.floor(Math.random() * config.length)];

  var problem = {};
  problem.letter = (["i" ,"j", "k", "n", "m"])[Math.floor(Math.random() * 5)];
  problem.start = Math.floor(Math.random() * Math.random() * 6);
  problem.expr = "";
  problem.converges = false;
  problem.answered = false;

  return (generate[type])(problem);
}

function gcd (a, b) {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
}

function arrayToPolynomialString (arr, variable) {
  var res = "";
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] != 0) {
      res = (arr[i] == 1 ? "" : arr[i]) + (i == 0 ? "" : variable + "^{" + (i == 1 ? "" : i) + "}") + res;
      if (i != arr.length - 1) {
        res = "+" + res;
      }
    }
  }
  while (res[res.length - 1] == '+') {
    res = res.substr(0, res.length - 1);
  }
  return res;
}

function randomCoeff () {
  var c = Math.floor(Math.random() * 10 + 1) * (Math.floor(Math.random() * 2) * 2 - 1);
  if (c == 1) return "";
  if (c == -1) return "-";
  return "" + c;
}

function randomPolynomialArray (maxDegree) {
  var degree = Math.floor(Math.random() * (maxDegree || 4) + 1);
  var u = [];
  for (var i = 0; i < degree + 1; ++i) {
    u[i] = Math.floor(Math.random() * 10);
    if (i == degree) u[i]++;
  }
  return u;
}

function renderCorrect (problem) {
  var congratsArr = ["That's right!", "Correct!", "Yup!", "Yes!", "Heck yeah!"];
  var congrats = congratsArr[Math.floor(Math.random() * congratsArr.length)];
  $(".explain").html(
    `${congrats} The series ${problem.converges ? "converges" : "diverges"}.
     You can find an explanation <button class='openExplain'>here [e]</button>, or move on
     to the 
     <button class='nextProblem'>Next Problem [n]</button>`
  );
}

function renderExplain (problem, correct) {
  var uhOhArr = ["Oops!", "Uh oh!", "Not quite!", "Almost!", "You'll get it next time."];
  var uhOh = uhOhArr[Math.floor(Math.random() * uhOhArr.length)];
  $(".explain").html(
    `${!correct ? uhOh : ""} The series ${problem.converges ? "converges" : "diverges"}.
     We're still working on explanations, but you can find tutorials
     on <a href="https://www.youtube.com/watch?v=xjmy5hkZccY&ab_channel=patrickJMT">
     geometric series</a>, 
     <a href="https://www.youtube.com/watch?v=ojztrQMqLgE&ab_channel=patrickJMT">
     the integral test</a>, 
     <a href="https://www.youtube.com/watch?v=xesQnFWw8f8&ab_channel=patrickJMT">
     comparison tests</a>, 
     <a href="https://www.youtube.com/watch?v=-K9Qt6YUIrI&ab_channel=patrickJMT">
     alternating series</a>, and 
     <a href="https://www.youtube.com/watch?v=iy8mhbZTY7g&ab_channel=patrickJMT">
     the ratio test</a> by PatrickJMT or 
     check out <a href="http://tutorial.math.lamar.edu/Classes/CalcII/SeriesIntro.aspx">
     Paul's Online Math Notes</a> for great lessons on series.
     <br/><br/>
     You can also go to the 
     <button class='nextProblem'>Next Problem [n]</button>`
  );
}

$(document).ready(function () {
  var currentProblem = generateProblem();
  renderProblem(currentProblem);

  $("#converges").click(function (e) {
    answerConverges(currentProblem);
  });

  $("#diverges").click(function (e) {
    answerDiverges(currentProblem);
  });

  $(".explain").on("click", "button.nextProblem", function (e) {
    currentProblem = generateProblem();
    renderProblem(currentProblem);
    $(".explain").html("");
  });

  $(".explain").on("click", "button.openExplain", function (e) {
    renderExplain(currentProblem, true);
  });

  $(document).keypress(function (e) {
    if (e.which == 99) {
      answerConverges(currentProblem);
    } else if (e.which == 100) {
      answerDiverges(currentProblem);
    } else if (e.which == 101) {
      if (currentProblem.answered) {
        renderExplain(currentProblem, true);
      }
    } else if (e.which == 13 || e.which == 110 || e.which == 32) {
      if (currentProblem.answered) {
        currentProblem = generateProblem();
        renderProblem(currentProblem);
        $(".explain").html("");
      }
    }
  });

  function answerConverges (currentProblem) {
    if (!currentProblem.answered) {
      if (currentProblem.converges) {
        renderCorrect(currentProblem);
      } else {
        renderExplain(currentProblem, false);
      }
      currentProblem.answered = true;
    }
  }

  function answerDiverges (currentProblem) {
    if (!currentProblem.answered) {
      if (!currentProblem.converges) {
        renderCorrect(currentProblem);
      } else {
        renderExplain(currentProblem, false);
      }
      currentProblem.answered = true;
    }
  }

  function renderProblem (problem) {
    var latex = "\\[\\sum\\limits_{"
                + problem.letter + "="
                + problem.start + "}^{\\infty}"
                + problem.expr + "\\]";
    $(".problem").html(latex);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
});
