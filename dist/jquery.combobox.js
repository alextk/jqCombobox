/*
* jqCombobox - jQuery plugin for creating styled select box (combobox)
*
* Version: 0.0.1
* Build: 19
* Copyright 2011 Alex Tkachev
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: 13 Dec 2011 21:24:32
*/

(function($) {

  $.fn.combobox = function(options) {
    if (options == 'api') {
      return this.data('api');
    } else if(options == 'destroy'){
      this.data('api').destroy();
      this.removeData('api');
    } else{
      return this.each(function() {
        var $this = $(this);
        if ($.type(options) === "object") {
          var type = options.type || $.fn.combobox.defaults.type;
          var clazz = null;
          if(type == 'single'){
            clazz = $.fn.combobox.classes.Combobox;
          } else if(type == 'multi'){
            clazz = $.fn.combobox.classes.MultipleCombobox;
          } else throw 'Unknown combobox type ' + type;
          $this.data('api', new clazz($this, $.extend(true, {}, $.fn.combobox.defaults, clazz.defaults || {}, options, {rtl: $this.css('direction') == 'rtl'})));
        }
      });
    }
  };

  $.fn.combobox.classes = {};

  $.fn.combobox.defaults = {
    type: 'single',
    items: [],
    position: {my: 'left top', at: 'left bottom', offset: "-1 0"},
    events: {}
  };

})(jQuery);
(function($) {

  /**
   * Progress bar class api
   */
  var ComboboxClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(ComboboxClass.prototype, {

    initialize: function(target, options) {
      this.target = target;
      this.options = options;

      this.selectionModel = new $.fn.combobox.classes.SingleSelectionModel();

      this.items = options.items.collect(function(item){
        var text = $.isUndefined(item.text) ? item.value : item.text;
        var value = $.isUndefined(item.value) ? item.text : item.value;
        return {text: text, value: value};
      });
      if(options.empty) this.items.unshift(options.emptyItem);

      this.el = this._createUI(target, options);
      this._bindListeners();
      this.renderItems();

      //find selected item index
      var selectedIndex = -1;
      if(!$.isUndefined(options.selectedValue)) {
        selectedIndex = this.items.findIndex(function(item){ return item.value == options.selectedValue; });
      }
      if(selectedIndex == -1) selectedIndex = 0;
      this.selectionModel.index(selectedIndex);
    },

    selectedIndex: function(newIndex){
      if(arguments.length == 0) return this.selectionModel.index();
      this.selectionModel.index(newIndex);
      return this;
    },

    selectedValue: function(){
      var index = this.selectedIndex();
      if(index >=0) return this.items[index].value;
    },

    togglePopup: function(show){
      var popup = $('div.popup', this.el);
      if(!$.isBoolean(show)) show = !popup.is(":visible");

      show ? this.showPopup() : this.hidePopup();
    },

    showPopup: function(){
      var popup = $('div.popup', this.el);
      popup.show();
      popup.position(this.options.position); //position the popup relative to button
      popup.width(this.el.width()); //adjust width of popup to match that of combobox
      $(document).bind('mousedown', {combobox: this}, this._onDocumntMouseDown);
      this._invokeCallback('show', {source: this});
    },

    hidePopup: function(){
      $(document).unbind('mousedown', this._onDocumntMouseDown);
      $('div.popup', this.el).hide();
      this._invokeCallback('hide', {source: this});
    },

    renderItems: function(){
      var popup = $('div.popup', this.el);
      var ul = $('<ul class="items"/>');

      var itemRenderer = function(item){
        return $('<li class="item"/>').html(item.text);
      };

      this.items.each(function(item){
        ul.append(itemRenderer(item));
      },this);
      popup.html(ul);
    },

    destroy: function(){
      this.el.remove();
    },

    _onDocumntMouseDown: function(event) {
      var target = $(event.target);
      if (target.closest('div.combobox-container').length === 0) {
        event.data.combobox.hidePopup();
      }
    },

    _onItemClick: function(event){
      var target = $(event.target);
      var li = target.closest('li.item');
      var itemIndex = li.index();
      if(itemIndex == -1) return;

      this.selectionModel.index(itemIndex);
      this.hidePopup();
    },

    _onSelectionChanged: function(event, data){
      $('.popup li.item', this.el).removeClass('selected');
      $('input[type=hidden]', this.el).val('');
      $('.value', this.el).html('&nbsp;');

      var index = this.selectionModel.index();
      if(index >= 0){
        var item = this.items[index];
        //update value
        $('.value', this.el).html(item.text);
        $('input[type=hidden]', this.el).val(item.value);
        //toggle selection in popup
        $('.popup li.item', this.el).eq(index).addClass('selected');
      }
      this._invokeCallback('change', {source: this, oldIndex: data.oldIndex, newIndex: data.newIndex});
    },

    _createUI: function(target, options) {
      var el = $(
        '<div class="combobox-container">' +
          '<div class="value"/>' +
          '<input type="hidden"/>' +
          '<div class="popup" style="display: none"/>' +
        '</div>'
      );
      el.addClass(options.type).toggleClass('rtl', options.rtl);
      target.html(el);

      var divValue = $('.value', el);
      divValue.height(el.height()).css({'line-height': el.height() + 'px'});
      options.position.of = divValue;

      return el;
    },

    _bindListeners: function(){
      $('.value', this.el).click(this.togglePopup.bind(this));
      $('.popup', this.el).click(this._onItemClick.bind(this));
      this.selectionModel.on('change', this._onSelectionChanged, this);
    },

    _invokeCallback: function(callbackName) {
      var callback = this.options.events[callbackName];
      if ($.isFunction(callback)){
        callback.apply(this.options.events.context || this, Array.prototype.slice.call(arguments, 1));
      }
      if($.isFunction(this.options.events.callback)){
        this.options.events.callback.apply(this.options.events.context || this, Array.prototype.slice.call(arguments, 1));
      }
    }

  });

  ComboboxClass.defaults = {
    empty: true,
    emptyItem: {text: 'Please select value', value: null}
  };

  $.fn.combobox.classes.Combobox = ComboboxClass;

})(jQuery);
(function($) {

  var SingleSelectionModelClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(SingleSelectionModelClass.prototype, $.ext.mixins.Observable, {

    _index: -1,

    initialize: function() {
    },

    index: function(newIndex){
      if(arguments.length < 1) return this._index; //getter

      //setter
      if(this._index == newIndex) return;

      var oldIndex = this._index;
      this._index = newIndex;

      this.fire('change', {oldIndex: oldIndex, newIndex: newIndex});
    },

    clear: function(){
      this.index(-1);
    }

  });

  $.fn.combobox.classes.SingleSelectionModel = SingleSelectionModelClass;

})(jQuery);
(function($) {

  /**
   * Progress bar class api
   */
  var MultipleComboboxClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(MultipleComboboxClass.prototype, {

    initialize: function(target, options) {
      this.target = target;
      this.options = options;

      this.selectionModel = new $.fn.combobox.classes.MultipleSelectionModel();

      this.items = options.items.collect(function(item){
        var text = $.isUndefined(item.text) ? item.value : item.text;
        var value = $.isUndefined(item.value) ? item.text : item.value;
        return {text: text, value: value};
      });

      this.el = this._createUI(target, options);
      this._bindListeners();
      this.renderItems();

      //find selected item index
      var selectedIndices = [];
      if(!$.isUndefined(options.selectedValues)) {
        selectedIndices = this.items.select(function(item){ return options.selectedValues.include(item.value); }).collect(function(item, index){ return index; });
      }
      this.selectionModel.indices(selectedIndices);
    },

    selectedIndices: function(newIndices){
      if(arguments.length == 0) return this.selectionModel.indices(); //getter

      this.selectionModel.indices(newIndices);
    },

    selectedValues: function(){
      var indices = this.selectedIndices();
      return indices.collect(function(index){ return this.items[index].value; }, this);
    },

    togglePopup: function(show){
      var popup = $('div.popup', this.el);
      if(!$.isBoolean(show)) show = !popup.is(":visible");

      show ? this.showPopup() : this.hidePopup();
    },

    showPopup: function(){
      var popup = $('div.popup', this.el);
      popup.show();
      popup.position(this.options.position); //position the popup relative to button
      popup.width(this.el.width()); //adjust width of popup to match that of combobox
      $(document).bind('mousedown', {combobox: this}, this._onDocumntMouseDown);
    },

    hidePopup: function(){
      $(document).unbind('mousedown', this._onDocumntMouseDown);
      $('div.popup', this.el).hide();
    },

    renderItems: function(){
      var popup = $('div.popup', this.el);
      var ul = $('<ul class="items"/>');

      var itemRenderer = function(item){
        return $('<li class="item"/>').append('<div class="icon"></span>', $('<div class="text">').html(item.text));
      };

      this.items.each(function(item){
        ul.append(itemRenderer(item));
      },this);
      popup.html(ul);
    },

    destroy: function(){
      this.el.remove();
    },

    _onDocumntMouseDown: function(event) {
      var target = $(event.target);
      if (target.closest('div.combobox-container').length === 0) {
        event.data.combobox.hidePopup();
      }
    },

    _onItemClick: function(event){
      var target = $(event.target);
      var li = target.closest('li.item');
      var itemIndex = li.index();
      if(itemIndex == -1) return;

      this.selectionModel.toggleIndex(itemIndex);
    },

    _onSelectionChanged: function(event, data){
      $('.popup li.item', this.el).removeClass('selected');

      var indices = this.selectionModel.indices();
      indices.each(function(index){
        var item = this.items[index];
        $('.popup li.item', this.el).eq(index).addClass('selected'); //add selection in popup
      }, this);

      //update selected values
      var selectedItems = indices.collect(function(index){ return this.items[index]; }, this);
      $('.value', this.el).html(selectedItems.length == 0 ? this.options.emptyText : selectedItems.property('text').join(', '));
      $('input[type=hidden]', this.el).val(selectedItems.property('value').join(', '));

      this._invokeCallback('change', {source: this});
    },

    _createUI: function(target, options) {
      var el = $(
        '<div class="combobox-container">' +
          '<div class="value"/>' +
          '<input type="hidden"/>' +
          '<div class="popup" style="display: none"/>' +
        '</div>'
      );
      el.addClass(options.type).toggleClass('rtl', options.rtl);
      target.html(el);

      var divValue = $('.value', el);
      divValue.height(el.height()).css({'line-height': el.height() + 'px'});
      options.position.of = divValue;

      return el;
    },

    _bindListeners: function(){
      $('.value', this.el).click(this.togglePopup.bind(this));
      $('.popup', this.el).click(this._onItemClick.bind(this));
      this.selectionModel.on('change', this._onSelectionChanged, this);
    },

    _invokeCallback: function(callbackName) {
      var callback = this.options.events[callbackName];
      if ($.isFunction(callback)){
        callback.apply(this.options.events.context || this, Array.prototype.slice.call(arguments, 1));
      }
    }

  });

  MultipleComboboxClass.defaults = {
    emptyText: 'Please select values'
  };

  $.fn.combobox.classes.MultipleCombobox = MultipleComboboxClass;

})(jQuery);
(function($) {

  var MultipleSelectionModelClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(MultipleSelectionModelClass.prototype, $.ext.mixins.Observable, {

    _indices: null,

    initialize: function() {
      this._indices = [];
    },

    indices: function(newIndices){
      if(arguments.length < 1) return this._indices; //getter

      //setter
      var oldIndices = this._indices;
      this._indices.clear();
      Array.prototype.push.apply(this._indices, newIndices);

      this.fire('change');
    },

    toggleIndex: function(index){
      if(this._indices.include(index)){
        this._indices.remove(index);
      } else {
        this._indices.push(index);
      }
      this.fire('change');
    },

    clear: function(){
      this.index([]);
    }

  });

  $.fn.combobox.classes.MultipleSelectionModel = MultipleSelectionModelClass;

})(jQuery);
