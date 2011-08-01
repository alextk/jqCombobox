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