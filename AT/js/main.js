$(function() {
	// zahl, nachkomma, dezimal, tausender
	// zahlenformatierung
	function nf(num,dig,dec,sep) {
		var x = [];
		var s = (num<0?"-":"");
			num = Math.abs(num).toFixed(dig).split(".");
		var r = num[0].split("").reverse();
		for (var i=1;i<=r.length;i++) {
			x.unshift(r[i-1]);
			if ( i%3===0 && i != r.length )
				x.unshift(sep);
		}
		return s+x.join("")+(num[1]?dec+num[1]:"");
	}

	var ie = (function(){
		var undef,rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer')
		{
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
				rv = parseFloat( RegExp.$1 );
		}
		return ((rv > -1) ? rv : undef);
	}());

	console.log(ie);
	if ( ie ) {
		if ( $('#results-display').length )
			$('#results-display')[0].style.setProperty( 'height', '600px', 'important' );
	}



	// detect touch & disable slider
	$("#slider-dist input").bind("slider:ready slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 0, ",", "."));
	});

	$("#slider-taxfree input").bind("slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 0, ",", ".")+" €");
	});

	$("#slider-taxamt input").bind("slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 1, ",", ".")+"% pro Jahr");
	});

	// rechner1.html
	$("body").on("click", "#button-dist", function() {
		var value = $("#slider-dist input").val();
		$.cookie("estimate", value);
	});

	// rechner2.html
	
	if ( $(".rechner2").length ) {
		// read cookies
		$("#sachvermoegen").val(parseFloat($.cookie("sachvermoegen")) || "");
		$("#finanzvermoegen").val(parseFloat($.cookie("finanzvermoegen")) || "");
		$("#schulden").val(parseFloat($.cookie("schulden")) || "");
		$("#mitglieder").val(parseFloat($.cookie("mitglieder")) || "");

		// write cookies on click, draw chart
		$("body").on("click", "#button-calculate", function() {
			$.cookie("sachvermoegen", $("#sachvermoegen").val().replace(/\D/g, '' ));
			$.cookie("finanzvermoegen", $("#finanzvermoegen").val().replace(/\D/g, '' ));
			$.cookie("schulden", $("#schulden").val().replace(/\D/g, '' ));
			$.cookie("mitglieder", $("#mitglieder").val().replace(/\D/g, '' ) || 1);

		// read cookies - sanitized :)
		$("#sachvermoegen").val(parseFloat($.cookie("sachvermoegen")) || "");
		$("#finanzvermoegen").val(parseFloat($.cookie("finanzvermoegen")) || "");
		$("#schulden").val(parseFloat($.cookie("schulden")) || "");
		$("#mitglieder").val(parseFloat($.cookie("mitglieder")) || "");

			drawWhoHasWhat();
		});
	}



	// rechner3.html
	$("body").on("click", "#button-simulate", function() {
		$.cookie("steuerfrei", $("#slider-taxfree input").val());
		$.cookie("steuersatz", parseFloat($("#slider-taxamt input").val()).toFixed(1));
		drawMyTaxModel();
	});

	// static data
	at = [ -21700, -6300, -3400, -1600, -200, 0, 100, 200, 400, 700, 1000, 1300, 1600, 2000, 2400, 2700, 3100, 3600, 4100, 4500, 4900, 5400, 6000, 6700, 7400, 8200, 9100, 10000, 10900, 11800, 12700, 13900, 15200, 16600, 18100, 19600, 20900, 22200, 23600, 25100, 26900, 28800, 30400, 32100, 33600, 35700, 37800, 41200, 43500, 46000, 48400, 50800, 53200, 55500, 58100, 61100, 64000, 67400, 70400, 73200, 75600, 78300, 81200, 83800, 86700, 89500, 91900, 94900, 98000, 101400, 105300, 109000, 113400, 116500, 120000, 124100, 129400, 134700, 141900, 148800, 155700, 162400, 170300, 180000, 191500, 204300, 217500, 232500, 247500, 263600, 285500, 317500, 352300, 392800, 446400, 521700, 648400, 886400, 1502200 ];
	// at.push(Number.MAX_VALUE);

	// lables
	labels = new Array(100);
	for (var i=1; i<labels.length; i++) {
		if ( (i) % 10 === 0) {
			labels[i] = (i)+" %";
		} else {
			labels[i] = "";
		}
	}
	labels[0] = "";
	labels[1] = "1%";
	labels.pop();
	labels.push("99%");

	findMyPosition = function(balance) {
		for (i = 0; i < at.length; i++) {
			if ( at[i] > balance ) {
				break;
			}
		}
		return i;
	};

	drawWhoHasWhat = function( ) {
		// calculate variables
		var sachvermoegen = parseFloat($.cookie("sachvermoegen")) || 0;
		var finanzvermoegen = parseFloat($.cookie("finanzvermoegen")) || 0;
		var schulden = parseFloat($.cookie("schulden")) || 0;
		var mitglieder = parseFloat($.cookie("mitglieder")) || 1;

		balance = (sachvermoegen + finanzvermoegen - schulden) / mitglieder;
		estimate = parseFloat($.cookie("estimate")) || 0;
		myPosition = findMyPosition(balance);
		$("#f-actual").html(myPosition);
		$("#f-estimate").html(estimate);
		$(".pos-estimate").html(estimate);
		$(".val-estimate").html(nf(at[estimate-1], 0, ",", "."));

		$(".val-actual").html(nf(balance, 0, ",", "."));
		$(".pos-actual").html(myPosition);

		// set up graph
		var ctx = $("#results-display").get(0).getContext("2d");
		var data = {
			labels : labels,
			datasets : [{
				fillColor : "#BE3C14",
				strokeColor : "white",
				highLightPos: myPosition-1,
				highLightColor : "#73A5B1",
				HLP2: estimate-1,
				HLC2: "green",
				data : at
			}]
		};

		var options = {
			// animation : false,
			scaleOverride : true,
			scaleSteps : 17,
			scaleStepWidth : 100000,
			scaleStartValue : -100000,
			scaleFontFamily : "'Lato'",
			barShowStroke : false,
			barStrokeWidth : 0,
			barValueSpacing : 1,
			barDatasetSpacing : 0
		};
		var myNewChart = new Chart(ctx).Bar(data, options);
		$(".showlater").slideDown();
	};


	drawMyTaxModel = function() {
		sachvermoegen = parseFloat($.cookie("sachvermoegen")) || 0;
		finanzvermoegen = parseFloat($.cookie("finanzvermoegen")) || 0;
		schulden = parseFloat($.cookie("schulden")) || 0;
		mitglieder = $.cookie("mitglieder");
		balance = (sachvermoegen + finanzvermoegen - schulden) / mitglieder;
		if (isNaN(balance))
			balance = 0.0;
		estimate = parseFloat($.cookie("estimate"));
		taxfree = parseFloat($.cookie("steuerfrei"));
		taxamt = parseFloat($.cookie("steuersatz"));

		myPosition = findMyPosition(balance);

		// calculate (absolute) tax for every class
		accumTax = 0.0;
		proptax = [];
		var i;
		for (i = at.length - 1; i >= 0; i--) {
			proptax[i] = 1.0 * Math.max(0, at[i] - taxfree) * taxamt / 100.0;
			accumTax += proptax[i];
		}

		percapita = 0.85 * accumTax / 100.0;

		myModel = [];
		for (i = at.length - 1; i >= 0; i--) {
			myModel[i] = percapita - proptax[i];
		}

		$("#percapita").html(nf(percapita,2,",",".") + " €");
		mytax = 1.0 * Math.max(0, balance - taxfree) * taxamt / 100.0;
		$("#mytax").html(nf(mytax, 2, ",", ".") + " €");
		$("#mytaxbalance").html(nf(percapita - mytax, 2, ",", ".") + " €");

		min = Math.floor(myModel[98]/1000)*1000;
		max = Math.ceil(myModel[0]/1000)*1000;
		steps = (max - min ) / 1000;

		// set up graph
		var ctx = $("#results-display").get(0).getContext("2d");
		var data = {
			labels : labels,
			datasets : [{
				fillColor : "#BE3C14",
				strokeColor : "white",
				highLightPos: myPosition-1,
				highLightColor : "#73A5B1",
				data : myModel
			}]
		};

		var options = {
			scaleOverride : true,
			scaleSteps : steps,
			scaleStepWidth : 1000,
			scaleStartValue : min,
			scaleFontFamily : "'Lato'",
			barShowStroke : false,
			barStrokeWidth : 0,
			barValueSpacing : 1,
			barDatasetSpacing : 0
		};
		var myNewChart = new Chart(ctx).Bar(data, options);
	};
});