var alldata=[];
var timeout=null;
var str;

//to fetch the data and clear the initial values
async function init()
{
    clearValue();
    alldata = await fetch("https://api.covid19india.org/raw_data.json").then(async data=>{return (await data.json()).raw_data});

    alldata = alldata.filter(data=>data.dateannounced!="");
    loadState();
    searchPatient(1);
}
/******Filter Block Methods ***************/
function loadState()
{
    
    let stateName=[...new Set(alldata.map(item => ("{\"value\":\""+item.detectedstate+"\"}")))].join(',');
    
    stateName = JSON.parse('['+stateName+']');

    $('#state-field').autocomplete({
        items: stateName,
        maxItems: 10
    }).on('selected.autocomplete', function(e, value, text)
     {  
        loadCaseList(text,"");
        loadDistrict(text);
        document.getElementById('district-detail-label').style.display = "none";
    });

    $("#state-field").val("Gujarat");
    loadDistrict("Gujarat");
    loadCaseList("Gujarat","");
}
function loadDistrictInput()
{
    document.getElementById('search-district').innerHTML = "<input class='form-control state-field' id='district-field' placeholder='Select District...'></input>"
}
function loadDistrict(stateValue)
{
    if(stateValue!="")
    {   
        loadDistrictInput();
        let districtName = [...new Set((alldata.filter(item=>item.detectedstate==stateValue)).map(item => ("{\"value\":\""+item.detecteddistrict+"\"}")))].join(',');
        districtName = JSON.parse('['+districtName+']');
        $('#district-field').autocomplete({
            items: districtName,
            maxItems:10
        }).on('selected.autocomplete', function(e, value, text)
         {  
            loadCaseList(stateValue,text);
        });
        
    }
}

function loadCaseList(stateName,districtName)
{
    if(stateName!="")
    {
        let caseObj;
        
        if(districtName !="")
        {
            caseObj = alldata.filter(item=>item.detectedstate==stateName && item.detecteddistrict==districtName);
            document.getElementById("state-detail-label").innerHTML ="<span style='color:white;'><u>State</u></span><br/>"+stateName;
            document.getElementById('district-detail-label').innerHTML = "<span style='color:white;'><u>District</u></span><br/>"+districtName;
            document.getElementById('district-detail-label').style.display = "block"
        }
        else
        {
            caseObj = alldata.filter(item=>item.detectedstate==stateName);
            document.getElementById("state-detail-label").innerHTML ="<span style='color:white;'><u>State</u></span><br/>"+stateName;
        }
        
        createCaseList(caseObj);
    }
    
}

function createCaseList(caseObj)
{

    let str="";
    str+="<ul class='case-list'>";
    str+="<li><h6>"+caseObj.length+" Cases Detail Available</h6></li>";
    str+="<li><span class='case-number'>Case No.</span><span class='case-number' style='border-right:0px solid white;'>Open</span></li>";
    for(let i=0; i<caseObj.length; i++)
    {
        str+="<li><span class='case-number'>"+caseObj[i].patientnumber+"</span><span class='case-det-link'><p onclick='search("+caseObj[i].patientnumber+")'>View Detail</p></span></li>";
    }
    str+="</ul>"
    document.getElementById('case-list-container').innerHTML = str;
}
/****** */



//on key down stop waiting for user
function stop_waiting(event)
{
    clearTimeout(timeout);
}
//on key up start waiting for another input
function start_waiting(value,event)
{
    timeout=setTimeout(function()
    {
        searchPatient(value);
    },1000);
 }

 //clears the default value
function clearValue()
{
    document.querySelector('#age_value').innerHTML = "-";
    document.querySelector('#gender_value').innerHTML = "-";
    document.querySelector('#detail_value').innerHTML = "-";
    document.querySelector('#date_value').innerHTML = "-";
    document.querySelector('#state_value').innerHTML = "-";
    document.querySelector('#district_value').innerHTML = "-";
    document.querySelector('#status_value').innerHTML = "-";
    document.querySelector('#patient_no_label_value').innerHTML = "Patient No. - ";
    document.querySelector('.patient_logo').style.display="none";
    hideSources();
}

function search(number)
{
    searchPatient(number);
    document.getElementById("details-block").scrollIntoView(true);
}

//search and initialze the data of patient
function searchPatient(patient_number)
{
    let patient_det = alldata.filter(item=>item.patientnumber==patient_number)[0];
    if(isNaN(patient_number))
    {
        clearValue();
        document.querySelector('#patient_no_label_value').innerHTML = "Not Valid";
    }
    else if(patient_det == null)
    {
        clearValue();
        document.querySelector('#patient_no_label_value').innerHTML = "Patient No. - ";
    }
    else
    {
        document.querySelector('.patient_logo').style.display="";
        document.querySelector('#age_value').innerHTML = (patient_det.agebracket != "")?patient_det.agebracket:"-";
        document.querySelector('#state_value').innerHTML = (patient_det.detectedstate != "")?patient_det.detectedstate:"-";
        document.querySelector('#district_value').innerHTML = (patient_det.detecteddistrict != "")?patient_det.detecteddistrict:"-";
        document.querySelector('#date_value').innerHTML=patient_det.dateannounced;
        document.querySelector('#detail_value').innerHTML = (patient_det.notes != "")?patient_det.notes:"Not Available";
        document.querySelector('#patient_no_label_value').innerHTML = 'Patient No. - '+patient_number;
        
        let gender_ele = document.querySelector('#gender_value');
        let logo_ele = document.querySelector('#gender_logo');
        let status_ele = document.querySelector('#status_value');
        let status_parent_ele = document.querySelector('.status');
        status_parent_ele.className = "card status";

        if(patient_det.gender == "F")
        {
            gender_ele.innerHTML = "Female";
            logo_ele.className = "fa fa-female";
        }
        else if(patient_det.gender == "M")
        {
            gender_ele.innerHTML = "Male";
            logo_ele.className = "fa fa-male";
        }
        else
        {
            document.querySelector('.patient_logo').style.display="none";
            gender_ele.innerHTML = "-";
            logo_ele.className = "fa fa-male";
        }

        status_ele.innerHTML = patient_det.currentstatus;
        if(patient_det.currentstatus.match(/deceased/gi) != null)
        {
            status_parent_ele.className += " death";
            logo_ele.className += " death";
        }
        else if(patient_det.currentstatus.match(/recovered/gi) != null)
        {
            status_parent_ele.className += " recovered";
            logo_ele.className += " recovered";
        }
        //if(patient_det.currentstatus.match(/hospitalized|migrated/gi) != null)
        else
        {
            status_parent_ele.className += " hospitalized";
            logo_ele.className += " hospitalized";
        }

        let source1_ele = document.querySelector('#source1_value');
        let source2_ele = document.querySelector('#source2_value');
        let source3_ele = document.querySelector('#source3_value');

        hideSources();
        checkSource('.source1','#source1_value',patient_det.source1);
        checkSource('.source2','#source2_value',patient_det.source2);
        checkSource('.source3','#source3_value',patient_det.source3);
    }
}

//if any source is available it will check for either link or simple content
function checkSource(parent,selected,source)
{
    element = document.querySelector(selected);
    if(source != "")
    {
        if(source.match(/^HTTP|^WWW/gi) != null)
        {
            let str1 = source.slice(source.indexOf('//')+2);
            let website = str1.slice(0,str1.indexOf('/'));
            element.innerHTML = "<a target=\"_blank\" href='"+source+"' >"+website+"</a>";
        }
        else
            element.innerHTML = source;
        document.querySelector(parent).style.display = "";
    }
}

//hides all the resources
function hideSources()
{
    document.querySelector('.source1').style.display="none";
    document.querySelector('.source2').style.display="none";
    document.querySelector('.source3').style.display="none";
}