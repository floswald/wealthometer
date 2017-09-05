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
		$(this).nextAll(".slider-value").html(nf(data.value, 1, ",", ".")+"% annuo");
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

	// IT wealth distribution data.
	// check ../../data/p99-wealthometer.xls
	at =  [-5604,0000,0000,0300,0500,1000,1200,1653,2000,2600,3000,4000,4703,5247,6000,6910,7880,8500,9800,10753,12500,15000,17038,20000,22818,26800,31000,35000,39736,44151,51000,57000,62700,67500,72393,77700,83901,90000,94000,98800,102671,107500,112100,118200,122000,125000,130812,135200,140275,146198,150800,153500,158000,162000,166000,171177,177522,182350,186357,191726,197625,202000,205050,209285,213500,219500,225000,232693,239163,247200,255107,260267,267100,275600,285000,295000,304625,311316,316000,323879,334000,346700,359060,375000,390500,409000,428452,453000,479400,509000,532713,572204,617100,669000,740000,851660,983000,1131700,1587281];

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
