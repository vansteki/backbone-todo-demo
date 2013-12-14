var planDom =  "<a id='card' class='list-group-item'><div class='id'><%=id%></div> <div class='title'><h3><%=name%></h3><div data-id='<%=id%>' class='kill label label-danger'>remove</div></div></a>";

var PlanView = Backbone.View.extend({
	events: {
		"click a": 'yo',
		"click .kill": 'del',
		"click .plus": 'save'
	},
	initialize: function(){
		this.model.on('hide', this.del, this);
		this.model.on('update', this.render, this);
	},
	template: _.template(planDom),
	render: function(){	
		var attr = this.model.toJSON();
		this.$el.html(this.template(attr));
		//use x-editable
		this.$el.find('h3').editable().on('save', function(e,params){
			//console.log('x-editable.save', this, params.newValue);
			self.model.set({'name': params.newValue}, {silent: true});
			self.model.save();
		});
		//console.log('sigle model render!',this.model.toJSON());
		return this;
	},
	del: function(e){
		console.log(e);
		this.remove();
		this.model.destroy();
	},
	save: function(){
		this.model.save();
	},
	yo: function(e){ console.log(e); }
});

var PlanCollection = Backbone.Collection.extend({
	initialize: function(){
		this.fetch();
	},
	url: 'http://localhost:403/plans'
});
var planCol = new PlanCollection();

var PlanListView = Backbone.View.extend({
	initialize: function(){
		this.listenTo(this.collection, 'change', function(model){ model.trigger('update'); });
		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'remove', function(model){ model.trigger('hide'); });
	},
	renderList: function() {
		this.collection.forEach(this.addOne, this);
		return this;
	},
	addOne: function(plan) {
		console.log(plan);
		//when model added or render , check if this model has default id if not add cid as temp id	
		if (plan.id == undefined){
			plan.save();	//send post to server, when server response back json {'id':newId, 'name': '...'}, it will set a newId to corresponding model 
			plan.set({id: plan.cid}); //if you sitch this and above line , you'll find backbone send PUT instead of POST
		}
		var planView = new PlanView({model: plan}); //console.log( planView.render().el);
		this.$el.append(planView.render().el);
	},
	reRender: function(plan) {
		this.$el.html('');
		this.renderList();
	}	
});

var planList = new PlanListView({
	collection: planCol
});

$(function(){
	$.fn.editable.defaults.mode = 'popup';
	$('#zone').append(planList.renderList().el);
	$('#zone').append("<div class='list-group-item'><div id='plus'><span class='glyphicon glyphicon-plus'></span></div></div>")
	$('#plus > .glyphicon-plus').click(function(){
		var item = prompt('enter new item');
		if(item != null) planCol.add({'name': item})
	})
});
