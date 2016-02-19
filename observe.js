var fs = require('fs')
var path = require('path')
var watch = require('watch')
var logclass = require('./log')
var logger;  
var observePath,
    destPath,
    exts,
    files = [];
try {
    var str = fs.readFileSync("./config.json");
    var json = JSON.parse(str);
    observePath = json.source;
    destPath = json.target;
    exts = json.exts;
    logger = logclass.init(json.logfile);
} catch (e) {
    logger.log("err","JSON parse config.json fails")
}

watch.createMonitor(observePath, function(monitor) {
    monitor.files[observePath] // Stat object for my zshrc.
    monitor.on("created", function(f, stat) {
        // Handle new files
        var stat = fs.lstatSync(f);
        var file = f.substr(observePath.length, f.length);
        logger.log("info",file + " created")
        if (stat.isDirectory()) {
            fs.mkdir(destPath + file, 777, function(status) {});
        } else {
            copyFile(f);
        }
    })
    monitor.on("changed", function(f, curr, prev) {
        var file = f.substr(observePath.length, f.length);
        logger.log("info",file + " changed")
        copyFile(f)
            // Handle file changes
    })
    monitor.on("removed", function(f, stat) {
            removeFile(f)
        })
        //monitor.stop(); // Stop watching
})


function copyFile(source, target) {
    var stat = fs.lstatSync(source);
    var ext = path.extname(source);
    if (!stat.isDirectory() && exts.indexOf(ext) == -1) return;
    var dest = target;
    if (!dest) {
        var file = source.substr(observePath.length);
        dest = destPath + file;
    }
    logger.log("info","COPY FILE:" + source + " " + dest);
    var readStream = fs.createReadStream(source);
    var writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
    readStream.on('end', function() {
        logger.log("info",'copy end');
    });
    readStream.on('error', function() {
        logger.log("info",'copy error');
    });
    logger.log("info","copy successful!")
}

function removeFile(f) {
    var file = f.substr(observePath.length);
    var targetFile = destPath + file;
    fs.exists(targetFile, function(exist) {
        if (exist) { //delete target file
            var stat = fs.lstatSync(targetFile);
            if (stat.isDirectory()) {
                fs.rmdirSync(targetFile);
            } else {
                fs.unlinkSync(targetFile)
            }
        }
    });
    logger.log("info",file + " removed")
}
