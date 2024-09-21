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
		$(this).nextAll(".slider-value").html(nf(data.value, 0, ",", "."));//Max: komma und punkt vertauscht!
	});

	$("#slider-taxfree input").bind("slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html("€" + nf(data.value, 0, ",", "."));//Max: komma und punkt vertauscht, $!
	});

	$("#slider-taxamt input").bind("slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 1, ",", ".")+"% por a&ntilde;o");//Max: komma und punkt vertauscht, per year!
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
	// spanish wealth distribution per capita.
	at = [ -61491.909, -23451.284, -11642.828, -5077.194, -2682.221, -1137.217, -42.854, 60.75, 294.085, 631.494, 1081.915, 1814.364, 2613.622, 3483.512, 5000.235, 6736.089, 9033.351, 11617.701, 14714.651, 17218.271, 20305.619, 24439.268, 27882.866, 31836.084, 35744.846, 40303.29, 43612.838, 46965.873, 50393.118, 53569.37, 56855.339, 61592.326, 65466.665, 68694.278, 72257.898, 76195.996, 79730.392, 82670.199, 85877.741, 89839.754, 93892.016, 98481.15, 101567.702, 104456.134, 107673.59, 111096.131, 114807.819, 118957.95, 122248.41, 125977.677, 130017.748, 134809.472, 139263.694, 144193.493, 148912.458, 153251.927, 157670.387, 162185.716, 166754.453, 171436.706, 176602.287, 183144.651, 188465.546, 194073.395, 200857.565, 206917.699, 214305.179, 222127.473, 229976.734, 234904.699, 242006.919, 252093.337, 260738.698, 268741.551, 280456.233, 291837.704, 304466.767, 318751.184, 328979.438, 342922.709, 355262.337, 369613.197, 388508.43, 405878.475, 424486.417, 447461.842, 467715.711, 490586.631, 516979.39, 546351.232, 585885.349, 631360.732, 682213.925, 747495.161, 851541.183, 968554.67, 1128913.287, 1356439.09, 1754235.074, 6197012.835 ];
		
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
		$(".val-estimate").html(nf(at[estimate-1], 0, ",", "."));//Max: komma und punkt vertauscht!

		$(".val-actual").html(nf(balance, 0, ",", "."));//Max: komma und punkt vertauscht!
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
			scaleSteps : 32,
			scaleStepWidth : 200000,
			scaleStartValue : -200000,
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

		percapita = 0.80 * accumTax / 100.0;

		myModel = [];
		for (i = at.length - 1; i >= 0; i--) {
			myModel[i] = percapita - proptax[i];
		}

		$("#percapita").html("€" + nf(percapita,2,",","."));//Max: komma und punkt vertauscht, $!
		mytax = 1.0 * Math.max(0, balance - taxfree) * taxamt / 100.0;
		$("#mytax").html("€" + nf(mytax, 2, ",", "."));//Max: komma und punkt vertauscht, $!
		$("#mytaxbalance").html("€" + nf(percapita - mytax, 2, ",", "."));//Max: komma und punkt vertauscht, $!

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
