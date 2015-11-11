setTimeout(() => {
    var doc = new jsPDF();
    var elementHandler = {
	'#hidden_div': function (element, renderer) {
	    return true;
	}
    };
    var source = window.document.getElementsByTagName("body")[0];
    console.log(source);
    doc.fromHTML(
	source,
	15,
	15,
	{
	    'width': 180,'elementHandlers': elementHandler
	});

    doc.output("dataurlnewwindow");

}, 2000)
