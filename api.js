var express = require('express')
    app = express()
    redis = require('redis')
    redisClient = redis.createClient()
    port = 403
    allowCrossDomain = function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")   //<--- for backbone PUT
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE')
        next()
    }

app.use(allowCrossDomain)
app.use(express.bodyParser())
redisClient.select(4)

app.get("/", function(req, res) {
    console.log(req.session)
    console.log(req.connection.remoteAddress)
    // req.session.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    res.send({msg:'Hello Redis', 'addr': req.connection.remoteAddress})
})

app.get("/reset", function(req, res){   
    var defaultPlans = [
            {'id':1, name: 'R0Oo0000O0000oCKer!!!!!!'},
            {'id':2, name: '潮爽德~撿到一百塊內~~'},
            {'id':3, name: '每年都說要去CWT但沒有一次去成 ORZ'},
            {'id':4, name: '柯南死神之旅'},
            {'id':5, name: '密室脫出...中'},
            {'id':6, name: 'NU PASTA!'}
                    ]
    redisClient.del('plans', function(err, result){
        if (err) res.send('del plans faild')
        //store each object as string in each list
        defaultPlans.forEach(function(val, key){ 
            redisClient.lpush('plans', JSON.stringify(val), function(err, redisRes){if (!err) console.log(val,'ok')})
            if(key +1 === defaultPlans.length){ res.send('done'); };
        })            
    })

})

app.get('/plans', function(req, res){
    //get each string from list as object
    var data = []
    redisClient.lrange('plans',0,-1, function(err, plans){        
        plans.reverse().forEach(function(val, key){                        
            data.push(JSON.parse(val))
            if (key +1 === plans.length){ res.send(data) }
        })
        if (err) console.log('error')
    })

})

app.get('/plans/:id', function(req, res){
    redisClient.lrange('plans', 0,-1, function(err, plans){
        plans.reverse().forEach(function(val,key){
            if (req.params.id == JSON.parse(val).id) res.send(JSON.parse(val))
        })
    })
})

app.get('/plans/:id/:newVal', function(req, res){
    redisClient.lrange('plans', 0,-1, function(err, plans){
        plans.forEach(function(val,key){    //don't use reverse here, it will cause update order error, see /rev
            if (req.params.id == JSON.parse(val).id){
                var uv = JSON.stringify({
                    'id': parseInt(req.params.id, 10),
                    'name':req.params.newVal
                })
                console.log(JSON.parse(val), key)
                redisClient.lset('plans', key, uv, function(err, r){
                    if (!err) res.send('ok')
                })
            }
        })
    })
})
app.put('/plans/:id', function(req, res){
    console.log('body', req.body)
    redisClient.lrange('plans', 0,-1, function(err, plans){
        plans.forEach(function(val, key){    //don't use reverse here, it will cause update order error, see /rev
            if (req.body.id == JSON.parse(val).id){
                var uv = JSON.stringify({
                    'id': parseInt(req.body.id, 10),
                    'name': req.body.name
                })
                console.log('old: ', JSON.parse(val), key)
                redisClient.lset('plans', key, uv, function(err, r){
                    if (!err) res.send('ok')
                })
            }
        })
    })
})

app.post('/plans', function(req, res){
    redisClient.lindex('plans', 0, function(err, r){
        if (err) res.send({msg: 'post plan error'})
        var lastId = (r == null)? 0: JSON.parse(r).id
        var newId = lastId + 1
        console.log('lastId', lastId)
        redisClient.lpush('plans', JSON.stringify({
            id: parseInt(newId, 10),
            name: req.body.name
        }), function(err, result){
            if(!err){
                console.log('done')
                res.send({
                    'id': newId,
                    'name': req.body.name
                })
            }
        })
    })    
})

app.delete('/plans/:id', function(req, res){
    console.log(req.body)
    console.log(req.params)
    redisClient.lrange('plans', 0, -1, function(err, plans){
        plans.forEach(function(val, key){
            if(JSON.parse(val).id == req.params.id){
                redisClient.lrem('plans', 0, val, function(err, r){
                    if (!err) console.log(r)
                    res.send(r)
                })
            }
        })
    })
})

app.get('/rev', function(req, res){
    var data = []
    redisClient.lrange('plans',0,-1, function(err, plans){
        plans.reverse().forEach(function(val, key){
            console.log(JSON.parse(val), key)
            data.push(JSON.parse(val))
            if(key +1 === plans.length){ res.send(data) }
        })
    })
})

app.listen(port, function(err,res){ if(!err) console.log('Listening on port ' + port) })

// function done(arr, key, cb){
//     if (key +1 === arr.length){ cb() }
// }
