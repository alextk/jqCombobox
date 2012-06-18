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

    popup: function(){
      return $('div.popup', this.el);
    },

    togglePopup: function(show){
      var popup = this.popup();
      if(!$.isBoolean(show)) show = !popup.is(":visible");

      show ? this.showPopup() : this.hidePopup();
    },

    showPopup: function(){
      var popup = this.popup();
      popup.show();
      this.adjustPopupSize();
      popup.position(this.options.position); //position the popup relative to button
      this.scrollToSelectedItem();
      $(document).bind('mousedown', {combobox: this}, this._onDocumntMouseDown);
      this._invokeCallback('show', {source: this});
    },

    adjustPopupSize: function(){
      var popup = this.popup();
      //set height
      var itemsHeight = popup.find('ul li').map(function(){ return jQuery(this).outerHeight() }).get().sum();
      if(itemsHeight > this.options.maxHeight){ //enforce max height
        popup.height(this.options.maxHeight);
      } else if(itemsHeight < popup.height()){ //reduce size
        popup.height(itemsHeight);
      } else if(itemsHeight > popup.height()){ //increase size
        popup.height(itemsHeight);
      }

      popup.width('auto'); //reset layer width, so items can grow as much they need to and their width can be calculated
      var itemsMaxWidth = popup.find('ul li').map(function(){ return jQuery(this).outerWidth() }).get().max();
      //set width to be at least as width of the menu buttons
      var elRelativeToWidth = this.el.outerWidth();
      if(itemsMaxWidth < elRelativeToWidth){
        popup.width(elRelativeToWidth-2);
      }
    },

    scrollToSelectedItem: function(){
      var popup = this.popup();
      var viewPortHeight = popup.height();
      var selectedIndex = this.selectedIndex();
      var li = popup.find('li:eq({0})'.format(selectedIndex));
      var newScrollTop = li.position().top - Math.floor(viewPortHeight/2);
      if(newScrollTop < 0) newScrollTop = 0;
      popup.scrollTop(newScrollTop);
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
      var self = event.data.combobox;
      var target = $(event.target);
      if (target.closest('div.combobox-container[data-id={0}]'.format(self.options.id)).length === 0) {
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
        '<div class="combobox-container" data-id="'+options.id+'">' +
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