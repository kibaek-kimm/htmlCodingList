var express = require('express');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var app = express();
var htmlListJson = require('./public/data/codingListInfo.json')
var htmlList = {};
var objFromJson;
var objTest;
var directoryLength = 0;

app.use(bodyParser.urlencoded({extended : true}));
app.use('/',express.static(path.join(__dirname , '/public')));

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function parseJsonData(target , source){
    // console.log(JSON.stringify(source,null,4));
    var key,
        i = 0,
        j = 0;

    /* Indexing in particular object */
    for(key in target){
        // console.log(key);
        // console.log('isGoodOjbect : ',Boolean(source[key]) , ' , and is this same object with target[key]?',source[key].path == target[key].path);
        if(source[key] && (source[key].path == target[key].path)){
            // console.log('key : ',key);
            /* Matching name property one by one which included  array in loop */
            for(; i < target[key].htmlData.length; i++){
                for(; j < source[key].htmlData.length; j++){
                    // console.log('Key is : ',key);
                    if(target[key].htmlData[i].name == source[key].htmlData[j].name){
                        // console.log('What is key of source[key]? : ',source[key]);
                        if(key == 'root___event'){
                            // console.log('INIKI DESC : ',source[key].htmlData[j].desc);
                        }
                        if(source[key].htmlData[j].desc){
                            // console.log(source[key].htmlData[j].name,' has description');
                            // console.log('\n\n');
                            // console.log('File name from target[key] is : ',target[key].htmlData[i].name);
                            // console.log('File name from source[key] is : ',source[key].htmlData[j].name);
                            // console.log('and desc is : ',source[key].htmlData[j].desc);
                            // console.log('\n\n');
                            target[key].htmlData[i].desc = source[key].htmlData[j].desc;

                            j = 0;
                            break;
                        }
                    }
                }
                j = 0;
            }
        }
    }

    // console.log('object : ',JSON.stringify(target));

    return target;

}

function writeFile(data , cb){
    // console.log(data);
    fs.writeFile('./public/data/codingListInfo.json',data,function(err){
        if(err) return console.log(err);
        if(cb && typeof cb == 'function'){
            cb();
        }
    });
}

function getDirectoriesLength(dirPath , callback){


    fs.readdir(path.join(__dirname,dirPath),function(err , fileList){
        fileList.forEach(function(file , index){
            var isDir = fs.statSync(path.join(__dirname,dirPath+file)).isDirectory();
            if(isDir){
                directoryLength++;
            }
        });
        console.log(directoryLength);
    });


}

getDirectoriesLength('./public/html/');


function initCordinglist(filePath , callback){
    if(Object.size(htmlList) == 0){
        getFilesFromDir([filePath] , callback);
    }
}


function getFilesFromDir(fileInfo , callback){
    /*
        fileInfo : [
            0 : Path
            1 : Category name (It will be key of object)
            2 : Root path
        ]
    */
    var ctgrName;
    var rootPath;

    if(fileInfo[1] == undefined){
        ctgrName = 'root';
        rootPath = '/';
    }else{
        ctgrName = fileInfo[1];
        rootPath = fileInfo[2]
    }

    fs.readdir(path.join(__dirname,fileInfo[0]),function(err , fileList){
        if(err) return console.log(err);

        directoryLength += 1;

        /* Setting peding value for indexing all directories perfectly */
        // console.log('Origin file length : ',fileList.length);
        var fileLength = fileList.length;
        var dirCount = 0;

        fileList.forEach(function(file , index){

            fs.stat(path.join(__dirname,fileInfo[0]+file),function(err , stats){

                var isDir = false;

                if(stats.isFile()){
                    var isExsist = false;

                    if(!htmlList[ctgrName]){
                        htmlList[ctgrName] = {
                            path : rootPath
                        };
                    }

                    /* Checking whether it has already that file infomation */
                    if(htmlList[ctgrName].htmlData){
                        for(var i = 0; i< htmlList[ctgrName].htmlData.length; i++){
                            if(htmlList[ctgrName].htmlData[i].name == file){
                                // console.log('Already exsist!');
                                isExsist = true;
                                break;
                            }
                        }
                    }


                    if(!isExsist){
                        if(htmlList[ctgrName].htmlData == undefined){
                            htmlList[ctgrName].htmlData = [];
                        }

                        htmlList[ctgrName].htmlData.push({
                            name : file
                        });

                        dirCount += 1;

                        // console.log(JSON.stringify(htmlList));
                    }
                }else{
                    /* If it is directory.. */
                    isDir = true;
                    getFilesFromDir([fileInfo[0]+file+'/' ,rootPath.replace(/^\//,'root___').replace(/\//,'___') + file, rootPath+file+'/'] , callback);
                }

                fileLength -= 1;
                // console.log(pendingValue);
                // console.log('is DIR : ',isDir);

                if(fileLength == 0){
                    callback.call(this , htmlList);

                    // console.log('isDir : ',isDir ,' hello?');
                }



            });

        });
        /* files.map END */
    });
    /* readdir END */

}
/* getFilesFromDir Function END */

initCordinglist('./public/html/' , function(result){
    // console.log('\n\n\n------------FINAL RESULT : ');
    htmlList = parseJsonData(result , htmlListJson);
    // console.log(JSON.stringify(htmlList , null , 4));
    writeFile(JSON.stringify(htmlList , null , 4));
    // console.log(directoryLength);
});


// writeFile(JSON.stringify(htmlList , null , 4));
// htmlList = parseJsonData(htmlList , htmlListJson);

app.get('/',function(req , res){
    // res.send('Hello world');
    res.sendFile(__dirname+'/public/html/index.html');
});

app.post('/modifyHtmlJson',function(req , res){
    var data = {
        objFromJson : objFromJson,
        objTest : objTest
    };
    writeFile(JSON.stringify(req.body.htmlList , null , 4) , function(){
        res.send(data);
    });

});


app.listen('3000',function(){
    console.log('Running server in 3000 port');
})
