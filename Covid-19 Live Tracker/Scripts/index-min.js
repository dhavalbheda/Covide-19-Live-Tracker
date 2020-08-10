var allCountryData;
var flagSort=false;
var indianData = {};
var allCountryTotal={};


function init()
{
	getIndiaData();
	getAllCountryData();
	getWorldData();
	
}

/* Create Number Loading Animation */
function animateNumbers(id,value)
{
	$('#'+id).each(function () {
		$(this).prop('Counter',0).animate({
			Counter: value
		}, {
			duration: 700,
			easing: 'swing',
			step: function (now) {
				$(this).text(Math.ceil(now).toLocaleString('en-IN'));
			}
		});
	});
}


/* Fetching India Data*/
async function getIndiaData()
{
	var obj = await fetch("https://api.covid19india.org/data.json").then(async data=>{return (await data.json()).statewise});
    obj= obj.filter(item=>item.confirmed!=0);
		
	let total_idx = obj.findIndex(function(person) {
		return person.state == "Total"
		});

	indianData["confirmed"] = obj[total_idx].confirmed;
	indianData["active"] = obj[total_idx].active;
	indianData["recovered"] = obj[total_idx].recovered;
	indianData["deaths"] = obj[total_idx].deaths;
	
	let dt_temp = Date(obj[total_idx].lastupdatedtime);
	dt = new Date(dt_temp);
	dt = dt.toLocaleString('default',{weekday:'short'})+" "+dt.toLocaleString('default',{dateStyle:'long',timeStyle:'short'})
	
	document.getElementById('last-update-india-time').innerText+=dt;
	animateNumbers('label-total-indiaCase',obj[total_idx].confirmed);
	animateNumbers('label-active-indiaCase',obj[total_idx].active);
	animateNumbers('label-recovered-indiaCase',obj[total_idx].recovered);
	animateNumbers('label-death-indiaCase',obj[total_idx].deaths);

	document.getElementById('popup-total-indiaCase').innerText+=obj[total_idx].deltaconfirmed;
	document.getElementById('popup-recover-indiaCase').innerText+=obj[total_idx].deltarecovered;
	document.getElementById('popup-death-indiaCase').innerText+=obj[total_idx].deltadeaths;
}

/* Fetching Total Statistic Of World */
async function getWorldData()
{
	
	var data = await fetch("https://covid-193.p.rapidapi.com/statistics?country=all", {
			"method": "GET",
			"headers": 
			{
				"x-rapidapi-host": "covid-193.p.rapidapi.com",
				"x-rapidapi-key": "b9eaef2490msh6520cfacca75e38p1ec47cjsn4c4820b42837"
			}
		});
		var obj =(await data.json()).response;

		allCountryTotal["confirmed"] = obj[0].cases.total;
		allCountryTotal["active"] = obj[0].cases.active;
		allCountryTotal["recovered"] = obj[0].cases.recovered;
		allCountryTotal["deaths"] = obj[0].deaths.total;

		dt = new Date(obj[0].time);
		dt = dt.toLocaleString('default',{weekday:'short'})+" "+dt.toLocaleString('default',{dateStyle:'long',timeStyle:'short'})
		document.getElementById('last-update-worldCase-time').innerText+=dt;
		animateNumbers('label-total-worldCase',obj[0].cases.total);
		animateNumbers('label-active-worldCase',obj[0].cases.active);
		animateNumbers('label-recovered-worldCase',obj[0].cases.recovered);
		animateNumbers('label-death-worldCase',obj[0].deaths.total);
		
		document.getElementById('popup-total-worldCase').innerText+=(obj[0].cases.new==null)?0:obj[0].cases.new;
		document.getElementById('popup-death-worldCase').innerText+=(obj[0].deaths.new==null)?0:obj[0].deaths.new;
		
}

/* Fetching All Country Data */
async function getAllCountryData()
{
	var data = await fetch("https://covid-193.p.rapidapi.com/statistics", {
					"method": "GET",
					"headers": {
						"x-rapidapi-host": "covid-193.p.rapidapi.com",
						"x-rapidapi-key": "b9eaef2490msh6520cfacca75e38p1ec47cjsn4c4820b42837"
					}
				});
		allCountryData =(await data.json()).response;
		createCountryTable(allCountryData);
}

/* Creating Country Table */
function createCountryTable(obj)
{
	var continent = ["All","North-America","Asia","Europe","South-America","Oceania","Africa"];
	var str="";	
	str+="<table id='country-table' class='country-table'>";
	str+="<thead><tr><th>Country,<br/>Other</th><th onclick=\"sortData(\'total\')\">Total<i class='sort-sign fa fa-sort'></i><br/>Cases</th><th onclick=\"sortData(\'active\')\">Active<i class='sort-sign fa fa-sort'></i><br/>Cases</th><th style='padding:0px;width:10px' onclick=\"sortData(\'recovered\')\">Total<i class='sort-sign fa fa-sort'></i><br/>Recovered</th><th onclick=\"sortData(\'deaths\')\">Total<i class='sort-sign fa fa-sort'></i><br/>Deaths</th></tr></thead><tbody class='country-table-body' id='country-table-body'>";
	for(let i=0; i<obj.length; i++)
	{
		if(!continent.includes(obj[i].country))
		{
			if(obj[i].country==="India" && i!=obj.length-1)
			{
				str+=getTableRow("India",indianData.confirmed,indianData.active,indianData.recovered,indianData.deaths);
				continue;
			}
			str+=getTableRow(obj[i].country,obj[i].cases.total,obj[i].cases.active,obj[i].cases.recovered,obj[i].deaths.total);
		}
	}
	str+="</tbody><tfoot>";
	str+=getTableRow("All",allCountryTotal.confirmed.toLocaleString('en-IN'),allCountryTotal.active.toLocaleString('en-IN'),allCountryTotal.recovered.toLocaleString('en-IN'),allCountryTotal.deaths.toLocaleString('en-IN'));
	str+="</tfoot></table>";
	document.getElementById("div-country-table").innerHTML=str;
	document.getElementById("table-detail").innerHTML = "The coronavirus COVID-19 is affecting <b style='color:red;font-size:25px;text-decoration:underline'>"+obj.length+"</b> Countries & Territories around the world With  International Conveyance.";
}

/* Generateing Row for Country Table  */
function getTableRow(country,confirmed,active,recovered,deaths)
{
	var str;
	str="<tr>";
	str+="<td>"+country+"</td>";	
	str+="<td>"+confirmed+"</td>";
	str+="<td>"+active+"</td>";
	str+="<td>"+recovered+"</td>";
	str+="<td>"+deaths+"</td>";
	str+="</tr>";
	return str;
}
		
function searchCountry(val)
{
	filter = val.toUpperCase();
	table = document.getElementById("country-table-body");
	tr = table.getElementsByTagName("tr");

	for (i = 0; i < tr.length; i++)
	{
		td = tr[i].getElementsByTagName("td");
		for(j=0; j<td.length; j++)
		{
			txtValue = td[j].textContent || td[j].innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1)
			{
				tr[i].style.display = "";
				break;
			} 
			else 
				tr[i].style.display = "none";
		}   		    
	}
}

/* Sort State Name Based On Confrimed */
function sortData(type)
{		
	var obj = allCountryData;
	if(flagSort)
	{
		flagSort=false;
		obj.sort(function(a, b){
			if(type=="deaths")
			{
				return b.deaths["total"] - a.deaths["total"];
			}
			return b.cases[type] - a.cases[type];
		});
	}
	else
	{
		flagSort=true;
		obj.sort(function(a, b){
			if(type=="deaths")
			{
				return a.deaths["total"] - b.deaths["total"];
			}
			return a.cases[type] - b.cases[type];
		});
		
	}
	createCountryTable(obj);
}