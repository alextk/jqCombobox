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