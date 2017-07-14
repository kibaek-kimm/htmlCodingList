var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var htmlListJson = require('./public/data/codingListInfo.json')
var htmlList = {};
var objFromJson;
var objTest;

app.use(bodyParser.urlencoded({extended : true}));
app.use('/',express.static(path.join(__dirname , '/public')));

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function writeFile(data , cb){
    // console.log(data);
    fs.writeFile('./public/data/codingListInfo.json',data,function(err){
        if(err) return console.log(err);
        if(cb && typeof cb == 'function'){
            cb();
        }
    });
}


function initCordinglist(filePath){
    if(Object.size(htmlList) == 0){
        getFilesFromDir(filePath);
    }
}

function parseJsonData(target , source){
    var key,
        i,
        j;

        console.log('여기는 올테고.. ');
    // console.log('object : ',target);


        console.log('여기 꺼정은 오긴하니? ');
        /* Indexing in particular object */
    for(key in target){
        if(source[key] && (source[key].path == target[key].path)){
            /* Matching name property one by one which included  array in loop */
            for(; i < target[key].htmlData.length; i++){
                for(; j < source[key].htmlData.length; j++){

                    console.log('key is',key);
                    if(target[key].htmlData[i].name == source[key].htmlData[j]){
                        console.log('key : ',key);
                        if(source[key].htmlData[j].desc){
                            console.log('and desc is : ',desc);
                            target[key].htmlData[i].desc = source[key].htmlData[j].desc;
                        }
                    }
                }
            }
            j = 0;
        }
    }

    console.log('object : ',JSON.stringify(target));

    return target;

}


function getFilesFromDir(filePath , ctgrName , rootPath){
    if(ctgrName == undefined){
        ctgrName = 'root';
        rootPath = '/';
    }

    var count = 0;
    var subDirInfo = [];

    fs.readdir(path.join(__dirname,filePath),function(err , files){
        if(err) return console.log(err);

        files.forEach(function(file , index){
            fs.stat(path.join(__dirname,filePath+file),function(err , stats){
                // console.log(file);

                // console.log(11111);
                if(stats.isFile()){
                    // console.log('FILE : ',file);
                    if(!htmlList[ctgrName]){
                        htmlList[ctgrName] = {
                            path : rootPath
                        };
                    }

                    var isExsist = false;

                    if(htmlList[ctgrName].htmlData){
                        for(var i = 0; i< htmlList[ctgrName].htmlData.length; i++){
                            if(htmlList[ctgrName].htmlData[i].name == file){
                                // console.log('Already has that file info');
                                // console.log('value : ',htmlList[ctgrName].htmlData[i].name);
                                // console.log('FILE : ',file);
                                isExsist = true;
                                break;
                            }
                        }
                    }

                    if(!isExsist){
                        // console.log('file in if statement : ',file);
                        if(htmlList[ctgrName].htmlData == undefined){
                            // console.log('file : ',file);
                            htmlList[ctgrName].htmlData = [];
                        }

                        htmlList[ctgrName].htmlData.push({
                            name : file
                        });
                        // htmlList[ctgrName].htmlData[count] = {
                        //     name : file
                        // };

                        // console.log('htmlList : ',htmlList);
                        // console.log('\n\n\n');
                    }
                }

                if(stats.isDirectory()){
                    subDirInfo.push({
                        filePath : filePath+file+'/',
                        ctgrName : rootPath.replace(/^\//,'root___').replace(/\//,'___') + file,
                        rootPath : rootPath+file+'/'
                    });
                }

                count += 1;

                if(count == files.length-1){
                    // htmlList = parseJsonData(htmlList , htmlListJson);
                    //
                    // subDirInfo.map(function(dirObj){
                    //     getFilesFromDir(dirObj.filePath ,dirObj.ctgrName, dirObj.rootPath);
                    // });
                }

                setTimeout(function(){
                    htmlList = parseJsonData(htmlList , htmlListJson);

                    subDirInfo.map(function(dirObj){
                        getFilesFromDir(dirObj.filePath ,dirObj.ctgrName, dirObj.rootPath);
                    });
                    writeFile(JSON.stringify(htmlList , null , 4));
                },2000);

            });

        });
        /* files.map END */
    });
    /* readdir END */
}
/* getFilesFromDir Function END */

initCordinglist('./public/html/');


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
