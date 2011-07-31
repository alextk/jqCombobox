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