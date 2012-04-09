/** 
 * Get the ISO week date week number 
 * from http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 */  
Date.prototype.getWeek = function () {  
    // Create a copy of this date object  
    var target  = new Date(this.valueOf());  
  
    // ISO week date weeks start on monday  
    // so correct the day number  
    var dayNr   = (this.getDay() + 6) % 7;  
  
    // ISO 8601 states that week 1 is the week  
    // with the first thursday of that year.  
    // Set the target date to the thursday in the target week  
    target.setDate(target.getDate() - dayNr + 3);  
  
    // Store the millisecond value of the target date  
    var firstThursday = target.valueOf();  
  
    // Set the target to the first thursday of the year  
    // First set the target to january first  
    target.setMonth(0, 1);  
    // Not a thursday? Correct the date to the next thursday  
    if (target.getDay() != 4) {  
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);  
    }  
  
    // The weeknumber is the number of weeks between the   
    // first thursday of the year and the thursday in the target week  
    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000  
}
/** 
* Get the ISO week date year number 
*/  
Date.prototype.getWeekYear = function ()   
{  
    // Create a new date object for the thursday of this week  
    var target  = new Date(this.valueOf());  
    target.setDate(target.getDate() - ((this.getDay() + 6) % 7) + 3);  
      
    return target.getFullYear();  
}

Date.prototype.date=function(){
 /* vars 
 * f : flag, prev char was '\' (escaped char)
 * t : tags, dict of tags:actions
 */
  var a=arguments,o='',f=false,p=false,t={
    d:['getDate',0,span     ],  // 01-31
    F:['getDay'             ],  // 0-6
    h:['getHours'           ],  // 0-23
    H:['getHours',0,span    ],  // 00-23
    i:['getMinutes',0,span  ],  // 00-59
    j:['getDate',           ],  // 1-31
    L:function(d){              //  boolean leap year
      return new Date( d.getFullYear() , 1, 29 ).getMonth()==1;
    },
    m:['getMonth',1         ],  // 1-12
    M:['getMonth',1,span    ],  // 01-12
    o:['getWeekYear',       ],  // 1999
    s:['getSeconds',0,span  ],  // 00-59
    t:function(d){              // 29-31 days in month
      return 32 - new Date(d.getYear(), d.getMonth, 32).getDate();
    },
    U:function(d){              // seconds since the Unix Epoch
      return d.getTime()/1000
    },
    w:['getDay',            ],  // 0-6 day of week
    W:['getWeek',           ],  // 0-53 get ISO 8601 week of year
    y:['getYear',-100       ],  // 11
    Y:['getFullYear'        ],  // 2011
    z:function(d){              // 0-365 day of year
      return (new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(d.getFullYear(),0,1))/86400000
    },
  }
  function span(d){
    return (d<10 ? '0':'')+d;
  }
  function get(D,f,t){
      var o='',s=t[1]||0,d=D[t[0]]()+s;
      return t[2] ? t[2](d):d;
    
  }
  for(var i=0;i<a[0].length;i++){
    if(!f && a[0][i] in t){
      if(typeof t[a[0][i]] == "function"){
        o+= t[a[0][i]](this) || '';
      } else {
        o+=get(this,a[0][i],t[a[0][i]]);
      }
    } else if (a[0][i]=='\\'){  // escaped char
      f=true;
    } else {
      o+=a[0][i];
      f=false;
    }
  }
  return o;
}
/*
getTime
getUTCDay
getUTCHours
getUTCMonth
*/
//d.getUTCMonth()
