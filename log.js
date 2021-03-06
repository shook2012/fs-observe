var fs = require('fs');
var buffersize = 30000;
exports.init = function(logfile){
        if(logfile){
                var buffer = new Buffer(buffersize);
                var fd = fs.openSync(logfile,'a');
        }
        function writeLog(type,logmsg){
                var log = {type:type,msg:logmsg,time:getTime()};
                console.log(formatLogMsg(log));
                fs.writeSync(fd,formatLogMsg(log),0,0,null);
        }
        return {
                log: function(type,logmsg){writeLog(type,logmsg)},
        };
}
//格式化日志内容
function formatLogMsg(log){
        return log.time + " [" + log.type + "] " + log.msg + "\n";
        // return [log.time,log.type,log.msg] + "\n";   
}

function getTime() {
        var t = new Date();
        return [t.getFullYear(), '-', add0(t.getMonth() + 1) , '-', add0(t.getDate()), ' ',
                add0(t.getHours()), ':', add0(t.getMinutes()), ':', add0(t.getSeconds())].join('');
}

function add0(num) {
        return num > 9 ? num : '0' + num;
}
