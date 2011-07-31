(function($) {

  /**
   * Progress bar class api
   */
  var ComboboxClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(ComboboxClass.prototype, {

    initialize: function(target, options) {
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

    selectedIndex: function(){
      return this.selectionModel.index();
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
    },

    hidePopup: function(){
      $(document).unbind('mousedown', this._onDocumntMouseDown);
      $('div.popup', this.el).hide();
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

      var index = this.selectionModel.index();
      if(index >= 0){
        var item = this.items[index];
        //update value
        $('.value', this.el).html(item.text);
        $('input[type=hidden]', this.el).val(item.value);
        //toggle selection in popup
        $('.popup li.item', this.el).eq(index).addClass('selected');

        this._invokeCallback('change', {source: this, oldIndex: data.oldIndex, newIndex: data.newIndex});
      }
    },

    _createUI: function(target, options) {
      var el = $(
        '<div class="combobox-container">' +
          '<div class="value"/>' +
          '<input type="hidden"/>' +
          '<div class="popup" style="display: none"/>' +
          '</div>'
      );
      el.toggleClass('rtl', options.rtl);
      target.replaceWith(el);

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

  $.fn.combobox = function(options) {
    if (options == 'api') {
      return this.data('api');
    } else {
      return this.each(function() {
        var $this = $(this);
        if ($.type(options) === "object") {

          $this.data('api', new ComboboxClass($this, $.extend(true, {}, $.fn.combobox.defaults, options, {rtl: $this.css('direction') == 'rtl'})));
        }
      });
    }
  };

  $.fn.combobox.classes = {};

  $.fn.combobox.defaults = {
    items: [],
    empty: true,
    emptyItem: {text: 'Please select value', value: null},
    position: {my: 'left top', at: 'left bottom', offset: "-1 0"},
    events: {}
  };

})(jQuery);