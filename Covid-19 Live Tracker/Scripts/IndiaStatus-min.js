var stateData;
var districtData;
var flagSort=false;
var stateName=[];
var activeCase=[];
var expand;

//to fetch and initialize the data
async function init()
{
	stateData = await fetch("https://api.covid19india.org/data.json").then(async data=>{return (await data.json()).statewise});
	districtData = await fetch("https://api.covid19india.org/state_district_wise.json").then(async data=>{return (await data.json())});
	stateData= stateData.filter(item=>item.confirmed!=0);

	loadStateGraph();
	loadTable(stateData);
}

/* Constructing & Loading State Table */
function loadTable(stateData)
{
	if(stateData[0]["state"]!="Total")
	{
		flagSort=true;
	}
	str="";
	str+="<thead><tr><th class='sign'></th><th style='width:30%'>State Name</th><th class='heading' onclick=\"sortData(\'confirmed\')\"	style='width:19%'>CONFIRMED<i class='sort-sign fa fa-sort'></i></th><th class='heading' style='width:14%' onclick=\"sortData(\'active\')\">ACTIVE<i class='sort-sign fa fa-sort'></i></th><th class='heading' style='width:20%' onclick=\"sortData(\'recovered\')\">RECOVERED<i class='sort-sign fa fa-sort'></i></th><th class='heading' style='width:20%' onclick=\"sortData(\'deaths\')\">DEATH<i class='sort-sign fa fa-sort'></i></th></tr></thead><tbody>";           
	for(let i=0; i<stateData.length; i++)
	{                     
		if(stateData[i]["state"]!="Total")
		{
			str+="<tr class='breakrow'>";
			str+="<td style='width:4%;'><i class='fa fa-angle-right' style='font-weight:bold;font-size:large'></i></td>";
			str+="<td>"+stateData[i]["state"]+"</td>";
			str+="<td>"+stateData[i]["confirmed"]+"</td>";
			str+="<td>"+stateData[i]["active"]+"</td>";
			str+="<td>"+stateData[i]["recovered"]+"</td>";
			str+="<td>"+stateData[i]["deaths"]+"</td></tr>";

			str+="<tr class='datarow'><td></td><td colspan='5'><div class='sub-container'><table class='child'>";
			str+="<thead><tr class='tableheader'><th style='width:100%'>District Name</th><th style='padding:0px 5px;'>CONFIRMED</th></tr></thead><tbody>";
			var total_dist = Object.keys(districtData[stateData[i]["state"]].districtData).forEach(key=>
			{
				str+="<tr class='districtrow'>";
				str+="<td>"+key+"</td>";
				str+="<td>"+districtData[stateData[i]["state"]].districtData[key].confirmed+"</td></tr>";
			});
			str+="</tbody></table></div></td></tr>"
		}
	}
	str+="</tbody>";
	let idx = stateData.findIndex(function(person) {
		return person.state == "Total";
	});
	str+="<tfoot><tr><th class='sign'></th><th>Total</th>";
	str+="<th>"+stateData[idx]["confirmed"]+"</th>";
	str+="<th>"+stateData[idx]["active"]+"</th>";
	str+="<th>"+stateData[idx]["recovered"]+"</th>";
	str+="<th>"+stateData[idx]["deaths"]+"</th></tr></tfoot>";
	
	document.getElementById("state-table").innerHTML=str;
}

/* Sort State Name Based On Confrimed */
function sortData(type)
{
	
	document.querySelector('#search-input').value = "";
		
	var obj = stateData;
	console.log(obj)
	if(flagSort)
	{
		obj.sort(function(a, b){
		return b[type] - a[type];
		});
		flagSort=false;
	}
	else
	{
		obj.sort(function(a, b){
			return a[type] - b[type];
		});
		flagSort=true;
	}
	loadTable(obj);
}

/* Add District Row Feature */
$(document).ready(function() //to access jquery from external js file we have to write this line
{
	//to open child rows
	$('#state-table').on('click', 'tr.breakrow',function()
	{
		$(this).closest('tr').nextUntil('.breakrow').slideToggle(100,"swing");
		let sign_class=$(this).find("i").attr('class');
		$(this).find("i").removeClass(sign_class);
		if(sign_class.indexOf('right') != -1)
			$(this).find("i").addClass('fa fa-angle-down');
		else
			$(this).find("i").addClass('fa fa-angle-right');   
	});
});
function searchStateDistrict(value)
{
	let state_rows = document.querySelectorAll('#state-table tbody tr');
	if(value != "clear" && value !="")
	{
		let parent_row_idx=0;
		let flag = false;
		for(let i=0;i<state_rows.length;i++)
		{
			if(state_rows[i].className == "datarow")
			{
				state_rows[i].style.display="none";
				if( state_rows[parent_row_idx].cells[0].childNodes[0].className.indexOf('down') != -1)
				{
					state_rows[parent_row_idx].cells[0].childNodes[0].className = "fa fa-angle-right";
				}
			}
			if(state_rows[i].className == "breakrow" || (!flag && state_rows[i].className == "districtrow"))
			{
				if(state_rows[i].className == "breakrow")parent_row_idx = i;
				let column_idx = (state_rows[i].className == "breakrow")?1:0;
				if(state_rows[i].cells[column_idx].innerHTML.toUpperCase().indexOf(value)!=-1)
				{
					state_rows[parent_row_idx].style.display="";
					flag = true;
				}
				else
				{
					state_rows[parent_row_idx].style.display="none";
					flag = false;
				}
			}
		}
	}
	else
	{
		for(let i=0;i<state_rows.length;i++)
		{
			if(state_rows[i].style.display == "none")
				state_rows[i].style.display="";
		}
	}
	//console.log(value);
	
}

/******* Graph File ******/

/* Loading  State Graph */
function loadStateGraph()
{
	var data = stateData.filter(item=>item.confirmed!=0 && item.state!="Total");
	for(let i=0;i<data.length;i++)
	{
		stateName.push(data[i].state);
		activeCase.push(parseInt(data[i].active));
	}
	google.charts.load('current', {packages: ['corechart', 'bar']});
	google.charts.setOnLoadCallback(drawTitleSubtitle);
}
/* Drawing Graph To div */
function drawTitleSubtitle() 
{
	let colors = ["rgb(255,140,0)","rgb(242,90,156)","rgb(123,104,238)","rgb(219,112,147)","rgb(189,242,208)","rgb(165,42,42)","rgb(34,139,34)","rgb(70,130,180)","rgb(255,105,180)","rgb(124,252,0)","rgb(32,178,170)","red","rgb(221,160,221)","rgb(244,164,96)","rgb(255,48,76)","rgb(119,136,153)","rgb(170,255,128)","rgb(32,178,170)","rgb(255,160,122)","silver","rgb(255,128,128)","rgb(174,87,255)","golden","rgb(59,163,255)","rgb(242,242,39)","rgb(110,242,77)","rgb(242,172,242)"];
	let Combined = new Array();
	Combined[0]=['State','Active Cases',{role:'style'},{role:'annotation'}];

	for(var i=0;i<stateName.length;i++)
	{
		Combined[i+1]=[stateName[i],activeCase[i],colors[i],activeCase[i]];
	}
	sortArray(Combined);

	var data = google.visualization.arrayToDataTable(Combined);
	materialOptions = {
		legend: { position: 'none' },
		width:'100%',
		chartArea: 
		{
			top:20,
			bottom:90,
			left:230,
			width:'70%',
			height:'100%',
		},
		'backgroundColor': 
		{
				'fill': 'black',
		},
		tooltip: { textStyle: { fontName: 'Arial', fontSize:18}},
		animation:
		{
			easing:'linear',
			duration:200,
			startup:true
		},
		chart: 
		{
			title: 'Covid-19 Affected Cases in India',
			subtitle: 'Data Is Based On State',
		},
		hAxis: 
		{
			titleTextStyle:{bold:true,italic:false,fontSize:20,color:'white'},
			textStyle:{fontSize:15,color:'white'},
			title: 'Active Cases',
		},
		vAxis: 
		{
			titleTextStyle:{bold:true,italic:false,fontSize:20,color:'white'},
			textStyle:{fontSize:15,color:'white'},
			maxTextLines:2,
			title: 'State',
			maxWidth:2
		},
		
	};
	
	var materialChart = new google.visualization.BarChart(document.getElementById('div-graph'));
	materialChart.draw(data, materialOptions);
	$(document).ready(function () {
			$(window).resize(function(){
		materialChart.draw(data, materialOptions);
		});
	});

}	

/* Short State Array For Graph */
function sortArray(stateArray)
{
	for(let i=1;i<stateArray.length;i++)
	{
		for(let j=i+1;j<stateArray.length;j++)
		{
			if(stateArray[i][1] < stateArray[j][1])
			{
				let temp = stateArray[i];
				stateArray[i]=stateArray[j];
				stateArray[j]=temp;
			}
		}
	}
}

