/**
    Infomation for your project
    * @property:{String : htmlPath}       Target html path
    * @property:{String : jsonFilePath}   Json file path
    * @property:{String : jsonFileName}   Json file name
                                         (You should create file before launch CodingList)
    * @property:{String : staticPath}     Path for static resource
*/
var codingListInfo = {
    htmlPath : setCustomPath('./public/html/'),
    jsonFilePath : setCustomPath('./public/data/'),
    jsonFileName : 'list.json',
    staticPath : '/public'
};

var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

var htmlPath = codingListInfo.htmlPath;
try{
    var htmlListJson = require(codingListInfo.jsonFilePath + codingListInfo.jsonFileName);
    console.log('import json');
}catch(e){
    console.log(e);
    writeFile('{}' , './public/data/')
}

var htmlList = {};

app.use('/',express.static(path.join(__dirname , codingListInfo.staticPath)));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.set('views', './views');
app.set('view engine', 'jade');


function setCustomPath(p){
    p.replace(/(^\/|^\w)/,function(val){
        if(val.match(/(\w|\W)/)){
        	return './'+val;
        }else{
        	return '.'+val;
        }
    }).replace(/\w$/,function(val){
        return val+'/';
    });

    return p;
}


/**
 * Merge two Object
 * @param {Object} target
 * @param {Object} source
 * @return {Object} Merged Object
 */
function parseJsonData(target , source){
    var key,
        i = 0,
        j = 0;
    console.log(1111);
    /* Indexing in particular object */
    for(key in target){
        if(source[key] && !!source[key].desc){
            console.log('폴더 설명');
            target[key].desc = source[key].desc;
        }

        if(source[key] && (source[key].path == target[key].path)){
            /* Matching name property one by one which included  array in loop */
            if(target[key].htmlData){
                for(; i < target[key].htmlData.length; i++){
                    for(; j < source[key].htmlData.length; j++){
                        if(target[key].htmlData[i].name == source[key].htmlData[j].name){

                            if(!!source[key].htmlData[j].desc){
                                target[key].htmlData[i].desc = source[key].htmlData[j].desc;

                                j = 0;
                                break;
                            }
                        }
                    }
                    j = 0;
                }
                i = 0;
            }

            if(target[key].folderData){
                for(; i < target[key].folderData.length; i++){
                    for(; j < source[key].folderData.length; j++){
                        if(target[key].folderData[i].name == source[key].folderData[j].name){

                            if(!!source[key].folderData[j].desc){
                                target[key].folderData[i].desc = source[key].folderData[j].desc;

                                j = 0;
                                break;
                            }
                        }
                    }
                    j = 0;
                }
            }

        }
        i = 0;
    }

    console.log(JSON.stringify(target));
    return target;
}


/**
 * Write new json file
 * @param {Object} data
 * @param {String} targetPath
 */
function writeFile(data , targetPath){
    console.log(__dirname , targetPath + codingListInfo.jsonFileName);
    fs.writeFile(path.join(__dirname , targetPath + codingListInfo.jsonFileName),data,function(err){
        console.log(htmlListJson);
        if(err) return console.log(err);
    });
}


/**
 * Get files and directories from specific path
 * @param {Array} fileInfo
                  (There are at maximun 3 items)
                  0 : Specific path
                  1 : Category name (It will be key of object)
                  2 : Root path
 * @param {Object} targetObj
 * @return {Object} Return Handled Object
 */
function getFilesFromDir(fileInfo , targetObj){
    var ctgrName;
    var rootPath;
    var htmlListData = targetObj ? targetObj : {};

    if(fileInfo[1] == undefined){
        ctgrName = 'root';
        rootPath = '/';
    }else{
        ctgrName = fileInfo[1];
        rootPath = fileInfo[2]
    }

    var fileList = fs.readdirSync(path.join(__dirname,fileInfo[0]));

    if(fileList.length > 0){
        fileList.forEach(function(file){
            var stats = fs.statSync(path.join(__dirname,fileInfo[0]+file));

            if(stats.isFile()  && !file.match(/\.html/) ){
                return;
            }

            if(stats.isFile()){
                var isExsist = false;

                if(!htmlListData[ctgrName]){
                    htmlListData[ctgrName] = {
                        path : rootPath
                    };
                }

                /* Checking whether it has already that file infomation */
                if(htmlListData[ctgrName].htmlData){
                    for(var i = 0; i< htmlListData[ctgrName].htmlData.length; i++){
                        if(htmlListData[ctgrName].htmlData[i].name == file){
                            isExsist = true;
                            break;
                        }
                    }
                }


                if(!isExsist){
                    if(htmlListData[ctgrName].htmlData == undefined){
                        htmlListData[ctgrName].htmlData = [];
                    }

                    htmlListData[ctgrName].htmlData.push({
                        name : file
                    });
                }
            }else{
                if(!htmlListData[ctgrName]){
                    htmlListData[ctgrName] = {
                        path : rootPath
                    };
                }

                if(htmlListData[ctgrName].folderData == undefined){
                    htmlListData[ctgrName].folderData = [];
                }

                htmlListData[ctgrName].folderData.push({
                    name : file
                });

                if( !(fileInfo[0]+file).match(/\/build\/?/) ){
                    getFilesFromDir([fileInfo[0]+file+'/' ,rootPath.replace(/^\//,'root___').replace(/\//g,'___') + file, rootPath+file+'/'] , htmlListData);
                }
            }
        });
    }else{
        htmlListData[ctgrName] = false;
    }

    return htmlListData;
}


/**
 * Initial HTML Coding list
 * @param {String} dirPath
 */
function init(dirPath){
    var newData = getFilesFromDir([dirPath]);
    var targetPath = './public/data/';
    console.log(JSON.stringify(newData));

    htmlList = parseJsonData(newData , htmlListJson);

    writeFile(JSON.stringify(htmlList , null , 4) , targetPath);
}


app.get('/',function(req , res){
    var reg = new RegExp(codingListInfo.staticPath.replace(/^./,''));
    var frontPath =  (codingListInfo.jsonFilePath.replace(/^.\//,'')).replace(reg,'');

    /* Target HTML PATH */
    init(htmlPath);
    res.render('index',{
        filePath : frontPath,
        fileName : codingListInfo.jsonFileName
    });
});

app.post('/modifyHtmlJson',function(req , res){
    htmlListJson = req.body.htmlList;

    writeFile(JSON.stringify(req.body.htmlList , null , 4) , req.body.targetPath);
    res.sendStatus(200);
});


app.listen('3000',function(){
    console.log('Running server in 3000 port');
});
