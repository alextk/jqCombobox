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
          var id = new Date().getTime().toString() + Math.floor(Math.random()*100003);
          $this.data('api', new clazz($this, $.extend(true, {id: id}, $.fn.combobox.defaults, clazz.defaults || {}, options, {rtl: $this.css('direction') == 'rtl'})));
        }
      });
    }
  };

  $.fn.combobox.classes = {};

  $.fn.combobox.defaults = {
    type: 'single',
    maxHeight: 200,
    items: [],
    position: {my: 'left top', at: 'left bottom', offset: "-1 0"},
    events: {}
  };

})(jQuery);