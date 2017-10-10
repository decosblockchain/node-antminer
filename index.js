var request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var parseUptime = function(uptimeText) {
  var uptime = 0;
  var startIndex = 0;

  if(uptimeText.indexOf('d', startIndex) > -1)
  {
    uptime += parseInt(uptimeText.substring(startIndex,uptimeText.indexOf('d', startIndex))) * 24 * 60 * 60;
    startIndex = uptimeText.indexOf('d', startIndex)+1;
  }

  if(uptimeText.indexOf('h', startIndex) > -1)
  {
    uptime += parseInt(uptimeText.substring(startIndex,uptimeText.indexOf('h', startIndex))) * 60 * 60;
    startIndex = uptimeText.indexOf('h', startIndex)+1;
  }

  if(uptimeText.indexOf('m', startIndex) > -1)
  {
    uptime += parseInt(uptimeText.substring(startIndex,uptimeText.indexOf('m', startIndex))) * 60;
    startIndex = uptimeText.indexOf('m', startIndex)+1;
  }

  if(uptimeText.indexOf('s', startIndex) > -1)
  {
    uptime += parseInt(uptimeText.substring(startIndex,uptimeText.indexOf('s', startIndex)));
  }

  return uptime;

}

exports.readStats = function(host, port, username, password, callback) {
  request.get('http://' + host + ':' + port + '/cgi-bin/minerStatus.cgi', {
    'auth': {
      'user': username,
      'pass': password,
      'sendImmediately': false
    }
  }, function (error, response, body) {
    if(error) 
    {
      callback(error, null);
      return;
    }
    var stats = {};

    const frag = JSDOM.fragment(body);
    var uptimeText = frag.querySelector("#ant_elapsed").textContent;




    stats.uptime = parseUptime(uptimeText);



    stats.megaHashRealtime = parseFloat(frag.querySelector("#ant_ghs5s").textContent.replace(',',''));
    stats.megaHashAverage = parseFloat(frag.querySelector("#ant_ghsav").textContent.replace(',',''));
    stats.blocksFound = parseInt(frag.querySelector("#ant_foundblocks").textContent);

    var fanSpeeds = 0;
    var fans = 0;
    var fanCells = frag.querySelectorAll("table#ant_fans tbody tr.cbi-section-table-row td.cbi-value-field");
    for(var i = 0; i < fanCells.length; i++) {
      if(fanCells[i].textContent != "0" && fanCells[i].textContent != "") {
        fans++;
        fanSpeeds += parseFloat(fanCells[i].textContent.replace(',',''));
      }
    }
    fanSpeeds /= fans;




    stats.fanSpeedAverage = fanSpeeds;
    stats.activeFans = fans;

    stats.pools = [];
    var poolRows = frag.querySelectorAll("table#ant_pools tbody tr.cbi-section-table-row");
    for(var i = 0; i <= 2; i++) stats.pools.push(poolRows[i].querySelector("#cbi-table-1-url").textContent)

    stats.acceptedShares = parseInt(poolRows[3].querySelector("#cbi-table-1-accepted").textContent.replace(',',''));

    var chipTemps = 0;
    var chainRows = frag.querySelectorAll("table#ant_devs tbody tr.cbi-section-table-row");
    for(var i = 0; i < chainRows.length; i++) {
      if(chainRows[i].querySelector("#cbi-table-1-chain").textContent == 'Total') continue;
      var chipTemp = chainRows[i].querySelector("#cbi-table-1-temp2").textContent;
      if(chipTemp.indexOf("O:") > -1)
        chipTemp = chipTemp.substring(chipTemp.indexOf('O:')+2);
      chipTemps += parseFloat(chipTemp);
    }

    chipTemps /= chainRows.length;

    stats.averageChipTemperature = chipTemps;



    callback(null, stats);
  });

}
