# Intro

A Backbone + express + redis todo demo

front end:
>- Backbone.js
>- Bootstrap
>- jQuery
>- x-editable

back end:
>- express
>- Redis

it's just for demo purpose, no security layer for both front and back end.

#Usage

1.install [Redis](http://redis.io/) first and run it!

    redis-server

2.install module 

    cd backbone-todo-demo/
    npm install

3.start express api

    node api.js

4.set db

    http://localhost:403/reset   //it will generate initial sample data in redis
  

5.enjoy

    http://localhost/todo.html   //if success, you will see a list
    





