const mysql = require('mysql2'),
rp = require("request-promise");


var pool  = mysql.createPool({
    host     : 'datazon.cluster-ro-cz4klgyhwh5j.us-east-1.rds.amazonaws.com',
    user     : 'admin',
    password : '13524688',
    database : 'data'
  });

  exports.handler =  (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    if (event.currentIntent.name === "greeting"){
        get_data();
        async function get_data(){
            var nm;
            try{
                nm =  await req_data(event.userId);

        var response = {
            "dialogAction": {
                "type": "Close",
                "fulfillmentState": "Fulfilled",
                "message":
                    {"contentType":"PlainText","content":`Hi ${nm.first_name}, welcome to DataZon. \nCurrently we have the United States IRS Data & Global COVID-19 Data. \nYou can ask me questions like: \nWhat is the corona virus updates in Italy? \nHow many corona virus cases in New York? \nDo you know how many corona virus cases in Kiowa County Colorado? \nAlso, you can ask about the IRS data with questions like: How many returns were filed in NY 10036? \nYou can query the COVID-19 Data by US Counties, US States, or by Countries. The IRS goes by US zipcode. \nLastly, but not the least, you can ask questions like: Can I see Visual Graph for the IRS Data? \nDo you have visual Graphs for the COVID-19 Data?`}

            }
         };
            } catch(e){throw (e)}
        callback(null,response); 
    }}
    else if (event.currentIntent.name === "IRS_Question"){
        pool.getConnection(function(err, connection) {
            connection.query(`SELECT * from IRS_2017 where zipcode = "11214"`, function (error, results, fields) {
                connection.release();
                if (err) callback(null,err);
                else {
                    if (results[0]){
                        var myResponse = "";
                        myResponse += `These are the returns that were filed for 2017: `;
                        for (var i = 0 ; i < results.length ; ++i){
                            myResponse += `\n${i+1}) ${results[i].num_total_returns} were filed with income size ${results[i].income_size_name}. `;
                        }
                        myResponse += `\nThese are all the total 2017 returns for ${event.currentIntent.slots.zipcode}.`;
                    const response = {
                        "dialogAction": {
                            "type": "Close",
                            "fulfillmentState": "Fulfilled",
                            "message": {
                                "contentType": "PlainText",
                                "content": `${myResponse}`
                            }
                        }
                    };
                    callback(null,response);
                    } else{
                        var response = {
                            "dialogAction": {
                                "type": "Close",
                                "fulfillmentState": "Fulfilled",
                                "message": {
                                    "contentType": "PlainText",
                                    "content": `I think you are searching COVID-19 Data by State. Unfortunately, I can't find any matches for State: ${event.currentIntent.slots.state}. \nPlease Try again with a different state name.`
                                }
                            }
                         };
                        callback(null,response); 
                    }
                }
            });
        });
    }
    else if (event.currentIntent.name === "query_covid_by_state"){
        pool.getConnection(function(err, connection) {
            connection.query(`SELECT * from covid where state = "${event.currentIntent.slots.state}" AND level = "state" \
            AND Date = (select max(date) from covid where state = "${event.currentIntent.slots.state}")`, function (error, results, fields) {
                connection.release();
                if (err) callback(null,err);
                else {
                    if (results[0]){
                        var myResponse = "";
                        myResponse += `These are the latest updates as of ${results[0].date}.\n`;
                        for (var i = 0 ; i < results.length ; ++i){
                            myResponse += `There is currently ${results[i].value} ${results[i].type}.\n`;
                        }
                        myResponse += `The Current population is ${results[0].population}.\n These are all the updates I have for State: ${event.currentIntent.slots.state}`;
                    const response = {
                        "dialogAction": {
                            "type": "Close",
                            "fulfillmentState": "Fulfilled",
                            "message": {
                                "contentType": "PlainText",
                                "content": `${myResponse}`
                            }
                        }
                    };
                    callback(null,response);
                    } else{
                        var response = {
                            "dialogAction": {
                                "type": "Close",
                                "fulfillmentState": "Fulfilled",
                                "message": {
                                    "contentType": "PlainText",
                                    "content": `I think you are searching COVID-19 Data by State. Unfortunately, I can't find any matches for State: ${event.currentIntent.slots.state}. \nPlease Try again with a different state name.`
                                }
                            }
                         };
                        callback(null,response); 
                    }
                }
            });
        });
    }
    else if (event.currentIntent.name === "query_covid_by_country"){
        pool.getConnection(function(err, connection) {
            connection.query(`SELECT * from covid where country = "${event.currentIntent.slots.country}" AND level = "country" \
            AND Date = (select max(date) from covid where country = "${event.currentIntent.slots.country}")`, function (error, results, fields) {
                connection.release();
                if (err) callback(null,err);
                else {
                    if (results[0]){
                        var myResponse = "";
                        myResponse += `These are the latest updates as of ${results[0].date}.\n`;
                        for (var i = 0 ; i < results.length ; ++i){
                            myResponse += `There is currently ${results[i].value} ${results[i].type}.\n`;
                        }
                        myResponse += `The Current population is ${results[0].population}.\n These are all the updates I have for Country: ${event.currentIntent.slots.country}`;
                    const response = {
                        "dialogAction": {
                            "type": "Close",
                            "fulfillmentState": "Fulfilled",
                            "message": {
                                "contentType": "PlainText",
                                "content": `${myResponse}`
                            }
                        }
                    };
                    callback(null,response);
                    } else{
                        var response = {
                            "dialogAction": {
                                "type": "Close",
                                "fulfillmentState": "Fulfilled",
                                "message": {
                                    "contentType": "PlainText",
                                    "content": `I think you are searching COVID-19 Data by Country. Unfortunately, I can't find any matches for Country: ${event.currentIntent.slots.country}. \nPlease Try again with a different country name.`
                                }
                            }
                         };
                        callback(null,response); 
                    }
                }
            });
        });         
    }
    else if (event.currentIntent.name === "query_covid_by_county"){
        pool.getConnection(function(err, connection) {
            connection.query(`SELECT * from covid where name like  "%_${event.currentIntent.slots.county}_%" AND state = "${event.currentIntent.slots.state}"\
             AND Date = (select max(date) from covid where name like "%_${event.currentIntent.slots.county}_%")` , function (error, results, fields) {
                connection.release();
                if (err) callback(null,err);
                else {
                    if (results[0]){
                        var myResponse = "";
                        myResponse += `These are the latest updates as of ${results[0].date}.\n`;
                        for (var i = 0 ; i < results.length ; ++i){
                            myResponse += `There is currently ${results[i].value} ${results[i].type}.\n`;
                        }
                        myResponse += `The Current population is ${results[0].population}.\n These are all the updates I have for County: ${event.currentIntent.slots.county}`;
                    const response = {
                        "dialogAction": {
                            "type": "Close",
                            "fulfillmentState": "Fulfilled",
                            "message": {
                                "contentType": "PlainText",
                                "content": `${myResponse}`
                            }
                        }
                    };
                    callback(null,response);
                    } else{
                        var response = {
                            "dialogAction": {
                                "type": "Close",
                                "fulfillmentState": "Fulfilled",
                                "message": {
                                    "contentType": "PlainText",
                                    "content": `I think you are searching COVID-19 Data by County & State. Unfortunately, I can't find any matches for County: ${event.currentIntent.slots.county} & State: ${event.currentIntent.slots.state}. \nPlease Try again with different names.`
                                }
                            }
                         };
                        callback(null,response); 
                    }
                }
            });
        });             
    }
    else {
        response = {
            "dialogAction": {
                "type": "Close",
                "fulfillmentState": "Fulfilled",
                "message": {
                    "contentType": "PlainText",
                    "content": `I am sorry, I did not understand that. \n Please can you try another question?`
                }
            }
         };
        callback(null,response);            
    }

async function req_data(sender){
    var result;
    try{
      var options = {
        uri: `https://graph.facebook.com/${sender}?fields=first_name`,
        qs: {
            access_token: "EAADXL3rUZAdsBAJuzBS8IfMccH1ZCGKpIZBRqbM0HgmzYKOxUq8kcXRVu63TIbbUJisrwfhL63veVU5oXFZAwrQsWYHCdPc4i1TSSpY5HYf4Oe5LZBCiZBgWKCqHwAC7I0nR0BbaFdFK3YYJkOMmDnLBQoWSjVLG1aczZA5LFP9JAZDZD"
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    result = await(rp(options));
    console.log(result);
    }
    catch (e){
    console.log(e);
    }
     return await result;  
}
    
};
