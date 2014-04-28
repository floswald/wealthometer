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
		$(this).nextAll(".slider-value").html(nf(data.value, 1, ",", ".")+"% το χρόνο");//Max: komma und punkt vertauscht, per year!
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
	// greek income distribution
	at = [-2991,-1018,0,0,58,260,500,644,1004,1350,1791,2250,2673,3155,3875,4860,5718,6754,7677,8643,9950,10863,12019,12969,14158,15124,16502,17301,18372,19232,20604,21790,22945,24055,25073,25504,26235,27009,27847,28636,29849,30696,31605,32782,33712,34873,35825,36707,37609,38562,39009,40048,40838,41813,42814,44330,45383,46631,48033,49162,50383,51280,52227,53575,54940,56196,57456,59219,60554,61694,63875,65137,67103,69011,71477,73166,75080,77241,79870,82216,84953,87382,90827,94281,98037,101695,105892,112838,118433,126795,133624,139415,148154,156394,173543,195782,219989,249947,335952];	
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
		$(".val-estimate").html(nf(at[estimate-1], 0, ".", ","));//Max: komma und punkt vertauscht!

		$(".val-actual").html(nf(balance, 0, ".", ","));//Max: komma und punkt vertauscht!
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
			scaleSteps : 5, //comment Max: das bestimmt die chart hoehe!
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